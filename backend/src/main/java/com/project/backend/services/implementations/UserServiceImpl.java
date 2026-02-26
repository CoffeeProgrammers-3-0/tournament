package com.project.backend.services.implementations;

import com.project.backend.dto.wrapper.PasswordRequest;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.repositories.UserRepository;
import com.project.backend.repositories.specifications.UserSpecification;
import com.project.backend.services.interfaces.UserService;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RealmResource realmResource;
    private final String clientUUID;
    private final Map<String, RoleRepresentation> clientRoles;
    private final WebClient webClient;

    @Value("${realm}")
    private String realm;
    @Value("${client-id}")
    private String clientId;
    @Value("${client-secret}")
    private String clientSecret;

    @Override
    public User createUserKeycloak(User user) {
        log.info("Service: Saving new user from keycloak {}", user.getEmail());
        return userRepository.save(user);
    }

    @Override
    public User updateUser(User newUser, long userId) {
        log.info("Service: Updating user with id {}", userId);

        User userToUpdate = findById(userId);

        String newFullName = newUser.getFullName();

        String keycloakUserId = userToUpdate.getKeycloakUserId();

        userToUpdate.setFullName(newFullName);

        UserRepresentation userRepresentation = realmResource.users().get(keycloakUserId).toRepresentation();
        userRepresentation.singleAttribute("fullName", newFullName);

        realmResource.users().get(keycloakUserId).update(userRepresentation);

        return userRepository.save(userToUpdate);
    }

    @Override
    public User updateUserKeycloak(User newUser, long userId) {
        log.info("Service: Updating user with id {} from keycloak", userId);

        User userToUpdate = findById(userId);

        userToUpdate.setFullName(newUser.getFullName());
        userToUpdate.setEmail(newUser.getEmail());
        userToUpdate.setRole(newUser.getRole());

        return userRepository.save(userToUpdate);
    }

    private boolean verifyOldPassword(String username, String password) {
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
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
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

        boolean isOldPasswordValid = verifyOldPassword(email, passwordRequest.getOldPassword());
        if (!isOldPasswordValid) {
            log.warn("Service: Old password is incorrect for user {}", email);
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
        return userRepository.findOne(UserSpecification.byKeycloakUserId(keycloakUserId)).orElseThrow(
                () -> new EntityNotFoundException("User not found")
        );
    }

    @Override
    public User findUserByEmail(String email) {
        log.info("Service: Finding user by email {}", email);
        return userRepository.findOne(UserSpecification.byEmail(email)).orElseThrow(
                () -> new EntityNotFoundException("User not found with email " + email));
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
    public User save(User user) {
        log.info("Service: Saving user {}", user);
        return userRepository.save(user);
    }

    @Override
    public void delete(Long userId) {
        User user = findById(userId);

        userRepository.delete(user);

        realmResource.users().delete(user.getKeycloakUserId());
    }

    @Override
    public User createJury(User user) {
        // TODO add user to keycloak/Set role to jury/Send password
        return null;
    }

    @Override
    public Page<User> findAllByRole(Integer page, Integer size, String query, Role role) {
        // TODO
        return null;
    }
}
