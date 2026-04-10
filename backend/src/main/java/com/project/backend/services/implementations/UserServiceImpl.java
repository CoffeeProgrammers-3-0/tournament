package com.project.backend.services.implementations;

import com.project.backend.dto.event.SendPasswordEvent;
import com.project.backend.dto.wrapper.PasswordRequest;
import com.project.backend.models.Round;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.UserRepository;
import com.project.backend.repositories.specifications.RoundSpecification;
import com.project.backend.repositories.specifications.UserSpecification;
import com.project.backend.services.interfaces.UserService;
import com.project.backend.utils.PasswordGenerationUtil;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RealmResource realmResource;
    private final String clientUUID;
    private final Map<String, RoleRepresentation> clientRoles;
    private final WebClient webClient;
    private final RoundRepository roundRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${realm}")
    private String realm;
    @Value("${client-id}")
    private String clientId;
    @Value("${client-secret}")
    private String clientSecret;

    @Override
    @Transactional
    public User createUser(User user, Role role) {
        user.setRole(role);

        log.info("Service: Saving new user {}", user.getEmail());

        if (userRepository.exists(UserSpecification.byEmail(user.getEmail()))) {
            throw new EntityExistsException("User with email " + user.getEmail() + " already exists");
        }

        User savedUser = userRepository.save(user);

        try {
            createUserInKeycloak(savedUser);
            savedUser = userRepository.save(savedUser);
        } catch (Exception e) {
            log.error("Keycloak creation failed, rolling back DB", e);
            userRepository.delete(savedUser);
            throw new IllegalStateException("Failed to create user in Keycloak");
        }

        return savedUser;
    }

    private void createUserInKeycloak(User user) {
        String email = user.getEmail();
        boolean isTestDomain = email != null && email.toLowerCase().endsWith("@test-user.com");

        String password = isTestDomain ? "passWord1" : PasswordGenerationUtil.generatePassword(12);
        boolean isTemporary = !isTestDomain;

        UserRepresentation userRepresentation = new UserRepresentation();
        CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
        credentialRepresentation.setTemporary(isTemporary);
        credentialRepresentation.setType(CredentialRepresentation.PASSWORD);
        credentialRepresentation.setValue(password);

        userRepresentation.setCredentials(List.of(credentialRepresentation));
        userRepresentation.singleAttribute("fullName", user.getFullName());
        userRepresentation.setEmail(email);
        userRepresentation.setEnabled(true);

        Response response = realmResource.users().create(userRepresentation);
        if (response.getStatus() == 201) {
            if (!isTestDomain) {
                eventPublisher.publishEvent(new SendPasswordEvent(password, email));
            }
            URI location = response.getLocation();
            String path = location.getPath();
            String keycloakUserId = path.substring(path.lastIndexOf('/') + 1);
            user.setKeycloakUserId(keycloakUserId);
        } else {
            log.error("Failed to create user in Keycloak. Status: {}, Error: {}",
                    response.getStatus(), response.readEntity(String.class));
            response.close();
            throw new IllegalStateException("Failed to create user in Keycloak");
        }
        response.close();

        realmResource.users()
                .get(user.getKeycloakUserId())
                .roles()
                .clientLevel(clientUUID)
                .add(List.of(clientRoles.get(user.getRole().name())));
    }

    @Override
    @Transactional
    public void delete(Long userId) {
        User user = findById(userId);

        try {
            realmResource.users().delete(user.getKeycloakUserId());
        } catch (Exception e) {
            log.error("Keycloak delete failed for user {}", user.getEmail(), e);
            throw new IllegalStateException("Failed to delete user in Keycloak");
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public User updateUser(User newUser, long userId) {
        log.info("Service: Updating user with id {}", userId);
        User userToUpdate = findById(userId);

        userToUpdate.setFullName(newUser.getFullName());

        try {
            UserRepresentation userRepresentation = realmResource.users()
                    .get(userToUpdate.getKeycloakUserId())
                    .toRepresentation();
            userRepresentation.singleAttribute("fullName", newUser.getFullName());
            realmResource.users().get(userToUpdate.getKeycloakUserId()).update(userRepresentation);
        } catch (Exception e) {
            log.error("Keycloak update failed for user {}", userToUpdate.getEmail(), e);
            throw new IllegalStateException("Failed to update user in Keycloak");
        }

        return userRepository.save(userToUpdate);
    }

    @Override
    @Transactional
    public User updateUserKeycloak(User newUser, long userId) {
        log.info("Service: Updating user with id {} from keycloak", userId);
        User userToUpdate = findById(userId);

        userToUpdate.setFullName(newUser.getFullName());
        userToUpdate.setEmail(newUser.getEmail());
        userToUpdate.setRole(newUser.getRole());

        return userRepository.save(userToUpdate);
    }

    public boolean verifyOldPassword(String username, String password) {
        log.info("Service: Verifying old password for user {}", username);
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "password");
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("username", username);
        formData.add("password", password);

        try {
            webClient.post()
                    .uri("/realms/" + realm + "/protocol/openid-connect/token")
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("Service: Successfully verified old password for user {}", username);
            return true;
        } catch (WebClientResponseException e) {
            log.warn("Service: Failed to verify old password for user {}", username, e);
            return false;
        }
    }

    @Override
    public boolean updatePassword(PasswordRequest passwordRequest, User user) {
        String keycloakUserId = user.getKeycloakUserId();
        String email = user.getEmail();

        log.info("Service: Updating password for user with email {}", email);

        if (!verifyOldPassword(email, passwordRequest.getOldPassword())) {
            log.warn("Old password is incorrect for user {}", email);
            throw new IllegalArgumentException("Old password is incorrect");
        }

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(passwordRequest.getNewPassword());
        credential.setTemporary(false);

        realmResource.users().get(keycloakUserId).resetPassword(credential);

        log.info("Password successfully updated for user {}", email);
        return true;
    }

    @Override
    public User findById(long id) {
        log.info("Service: Finding user with id {}", id);
        return userRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User with id " + id + " not found"));
    }

    @Override
    public User findUserByAuth(Authentication authentication) {
        log.info("Service: Finding user by authentication");
        return findUserByKeycloakUserId(authentication.getName());
    }

    @Override
    public User findUserByKeycloakUserId(String keycloakUserId) {
        log.info("Service: Finding user by keycloakUserId {}", keycloakUserId);
        return userRepository.findOne(UserSpecification.byKeycloakUserId(keycloakUserId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public User findUserByEmail(String email) {
        log.info("Service: Finding user by email {}", email);
        return userRepository.findOne(UserSpecification.byEmail(email))
                .orElseThrow(() -> new EntityNotFoundException("User not found with email " + email));
    }

    @Override
    public User findUserByEmailOrNull(String email) {
        log.info("Service: Finding user by email {}", email);
        return userRepository.findOne(UserSpecification.byEmail(email)).orElse(null);
    }

    @Override
    public boolean isNotExistByEmail(String email) {
        log.info("Service: Checking if user with email {} exist", email);
        return !userRepository.exists(UserSpecification.byEmail(email));
    }

    @Override
    public void checkEmail(String email) {
        log.info("Service: Checking if user with email {}", email);
        if (userRepository.exists(UserSpecification.byEmail(email))) {
            throw new EntityExistsException("User with email " + email + " already exists");
        }
    }

    @Override
    @Transactional
    public User save(User user) {
        log.info("Service: Saving user {}", user);
        return userRepository.save(user);
    }

    @Override
    public Page<User> findAllByRole(Integer page, Integer size, String query, Role role) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fullName"));
        return userRepository.findAll(
                Specification.allOf(UserSpecification.byRole(role), UserSpecification.byFullName(query)),
                pageRequest);
    }

    @Override
    public Page<User> findAllJuriesUsersForRound(Integer page, Integer size, String query, Long roundId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fullName"));
        return userRepository.findAll(
                Specification.allOf(UserSpecification.juriesByRoundId(roundId), UserSpecification.byFullName(query)),
                pageRequest);
    }

    @Override
    public Page<User> findAllJuriesUsersForSubmission(Integer page, Integer size, String query, Long submissionId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fullName"));
        return userRepository.findAll(
                Specification.allOf(UserSpecification.juriesBySubmissionId(submissionId), UserSpecification.byFullName(query)),
                pageRequest);
    }

    @Override
    public Page<User> findAllAvailableJuriesUsersForSubmission(Integer page, Integer size, String query, Long submissionId) {
        Round round = roundRepository.findOne(RoundSpecification.bySubmissionId(submissionId)).orElseThrow(() -> new EntityNotFoundException("Round for submission with id " + submissionId + " not found"));
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fullName"));
        return userRepository.findAll(
                Specification.allOf(UserSpecification.juriesByRoundId(round.getId()),
                        UserSpecification.juriesAvailableBySubmissionId(submissionId),
                        UserSpecification.byFullName(query)),
                pageRequest);
    }

    @Override
    public List<User> findAllUsersOfUsersTeam(User user, Long roundId) {
        return userRepository.findAll(UserSpecification.teammatesInRound(user.getId(), roundId), Sort.by(Sort.Direction.ASC, "fullName"));
    }

    @Override
    public List<User> findByEmail(String email, int count) {
        if (count <= 0) return List.of();

        PageRequest limit = PageRequest.of(0, count);

        return userRepository.findAll(UserSpecification.byEmail(email), limit).getContent();
    }
}