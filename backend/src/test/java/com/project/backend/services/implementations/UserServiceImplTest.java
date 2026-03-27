//package com.project.backend.services.implementations;
//
//import com.project.backend.dto.wrapper.PasswordRequest;
//import com.project.backend.models.User;
//import com.project.backend.models.constants.Role;
//import com.project.backend.repositories.UserRepository;
//import jakarta.persistence.EntityExistsException;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.keycloak.admin.client.resource.RealmResource;
//import org.keycloak.admin.client.resource.UserResource;
//import org.keycloak.admin.client.resource.UsersResource;
//import org.keycloak.representations.idm.CredentialRepresentation;
//import org.keycloak.representations.idm.RoleRepresentation;
//import org.keycloak.representations.idm.UserRepresentation;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.context.ApplicationEventPublisher;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.jpa.domain.Specification;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class UserServiceImplTest {
//
//    @Mock
//    private UserRepository userRepository;
//    @Mock
//    private RealmResource realmResource;
//    @Mock
//    private Map<String, RoleRepresentation> clientRoles;
//    @Mock
//    private WebClient webClient;
//    @Mock
//    private ApplicationEventPublisher eventPublisher;
//
//    @InjectMocks
//    private UserServiceImpl service;
//
//    private User user;
//
//    @BeforeEach
//    void setup() {
//        user = new User();
//        user.setId(1L);
//        user.setEmail("test@test.com");
//        user.setKeycloakUserId("kc1");
//    }
//
//    @Test
//    void findById_shouldReturnUser() {
//        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
//
//        User result = service.findById(1L);
//
//        assertEquals(1L, result.getId());
//    }
//
//    @Test
//    void findById_shouldThrow_whenNotFound() {
//        when(userRepository.findById(1L)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> service.findById(1L));
//    }
//
//    @Test
//    void findUserByEmail_shouldReturnUser() {
//        String email = "user@test.com";
//        User user = new User();
//        user.setEmail(email);
//
//        when(userRepository.findOne(
//                argThat((Specification<User> spec) -> spec != null)
//        )).thenReturn(Optional.of(user));
//
//        User result = service.findUserByEmail(email);
//
//        assertEquals(email, result.getEmail());
//    }
//
//    @Test
//    void findUserByEmailOrNull_shouldReturnNullIfNotFound() {
//        String email = "notfound@test.com";
//
//        when(userRepository.findOne(
//                argThat((Specification<User> spec) -> spec != null)
//        )).thenReturn(Optional.empty());
//
//        User result = service.findUserByEmailOrNull(email);
//
//        assertNull(result);
//    }
//
//    @Test
//    void isNotExistByEmail_shouldReturnTrueWhenNotExists() {
//        String email = "new@test.com";
//
//        when(userRepository.exists(
//                argThat((Specification<User> spec) -> spec != null)
//        )).thenReturn(false);
//
//        boolean result = service.isNotExistByEmail(email);
//
//        assertTrue(result);
//    }
//
//    @Test
//    void isNotExistByEmail_shouldReturnFalseWhenExists() {
//        String email = "exists@test.com";
//
//        when(userRepository.exists(
//                argThat((Specification<User> spec) -> spec != null)
//        )).thenReturn(true);
//
//        boolean result = service.isNotExistByEmail(email);
//
//        assertFalse(result);
//    }
//
//    @Test
//    void checkEmail_shouldThrow_whenEmailExists() {
//        String email = "exists@test.com";
//
//        when(userRepository.exists(
//                argThat((Specification<User> spec) -> spec != null)
//        )).thenReturn(true);
//
//        assertThrows(EntityExistsException.class, () -> service.checkEmail(email));
//    }
//
//    @Test
//    void save_shouldReturnSavedUser() {
//        when(userRepository.save(user)).thenAnswer(inv -> inv.getArgument(0));
//
//        User result = service.save(user);
//
//        assertEquals(user, result);
//    }
//    @Test
//    void updateUser_shouldUpdateFieldsAndCallKeycloak() {
//        User newUser = new User();
//        newUser.setFullName("New Name");
//
//        UsersResource usersResource = mock(UsersResource.class);
//        UserResource userResource = mock(UserResource.class);
//        UserRepresentation userRepresentation = mock(UserRepresentation.class);
//
//        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
//        when(realmResource.users()).thenReturn(usersResource);
//        when(usersResource.get("kc1")).thenReturn(userResource);
//        when(userResource.toRepresentation()).thenReturn(userRepresentation);
//        when(userRepository.save(user)).thenAnswer(inv -> inv.getArgument(0));
//
//        User result = service.updateUser(newUser, 1L);
//
//        assertEquals("New Name", result.getFullName());
//        verify(userRepresentation).singleAttribute("fullName", "New Name");
//        verify(userResource).update(userRepresentation);
//    }
//
//    @Test
//    void updateUserKeycloak_shouldUpdateLocalFields() {
//        User newUser = new User();
//        newUser.setFullName("Updated");
//        newUser.setEmail("updated@test.com");
//        newUser.setRole(Role.ADMIN);
//
//        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
//        when(userRepository.save(user)).thenAnswer(inv -> inv.getArgument(0));
//
//        User result = service.updateUserKeycloak(newUser, 1L);
//
//        assertEquals("Updated", result.getFullName());
//        assertEquals("updated@test.com", result.getEmail());
//        assertEquals(Role.ADMIN, result.getRole());
//    }
//
//    @Test
//    void delete_shouldCallRepositoryAndRealm() {
//        UsersResource usersResource = mock(UsersResource.class);
//        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
//        when(realmResource.users()).thenReturn(usersResource);
//
//        service.delete(1L);
//
//        verify(userRepository).delete(user);
//        verify(usersResource).delete("kc1");
//    }
//
//    @Test
//    void createUser_shouldThrowIfEmailExists() {
//        User newUser = new User();
//        newUser.setEmail("exists@test.com");
//        when(userRepository.exists(argThat((Specification<User> spec) -> spec != null))).thenReturn(true);
//
//        assertThrows(EntityExistsException.class, () -> service.createUser(newUser, Role.USER));
//    }
//
//    @Test
//    void findUserByKeycloakUserId_shouldReturnUser() {
//        when(userRepository.findOne(argThat((Specification<User> spec) -> spec != null))).thenReturn(Optional.of(user));
//
//        User result = service.findUserByKeycloakUserId("kc1");
//
//        assertEquals(user, result);
//    }
//
//    @Test
//    void findUserByKeycloakUserId_shouldThrowIfNotFound() {
//        when(userRepository.findOne(argThat((Specification<User> spec) -> spec != null))).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> service.findUserByKeycloakUserId("kc1"));
//    }
//
//    @Test
//    void findUserByAuth_shouldCallFindByKeycloakUserId() {
//        Authentication auth = mock(Authentication.class);
//        when(auth.getName()).thenReturn("kc1");
//        UserServiceImpl spy = spy(service);
//        doReturn(user).when(spy).findUserByKeycloakUserId("kc1");
//
//        User result = spy.findUserByAuth(auth);
//
//        assertEquals(user, result);
//    }
//
//    @Test
//    void findAllByRole_shouldReturnPagedUsers() {
//        User u1 = new User();
//        Page<User> page = new PageImpl<>(List.of(u1));
//        when(userRepository.findAll(argThat((Specification<User> spec) -> spec != null), any(PageRequest.class))).thenReturn(page);
//
//        Page<User> result = service.findAllByRole(0, 10, "search", Role.USER);
//
//        assertEquals(1, result.getContent().size());
//    }
//
//    @Test
//    void findUserByEmailOrNull_shouldReturnUserOrNull() {
//        when(userRepository.findOne(argThat((Specification<User> spec) -> spec != null))).thenReturn(Optional.of(user));
//        assertNotNull(service.findUserByEmailOrNull("test@test.com"));
//
//        when(userRepository.findOne(argThat((Specification<User> spec) -> spec != null))).thenReturn(Optional.empty());
//        assertNull(service.findUserByEmailOrNull("notfound@test.com"));
//    }
//
//    @Test
//    void updatePassword_shouldReturnTrueWhenOldPasswordValid() {
//        User testUser = new User();
//        testUser.setEmail("email@test.com");
//        testUser.setKeycloakUserId("kc1");
//
//        PasswordRequest req = new PasswordRequest();
//        req.setOldPassword("old");
//        req.setNewPassword("new");
//
//        UserServiceImpl spy = spy(service);
//        doReturn(true).when(spy).verifyOldPassword("email@test.com", "old");
//
//        UserResource userResource = mock(UserResource.class);
//        UsersResource usersResource = mock(UsersResource.class);
//
//        when(realmResource.users()).thenReturn(usersResource);
//        when(usersResource.get("kc1")).thenReturn(userResource);
//
//        boolean result = spy.updatePassword(req, testUser);
//
//        assertTrue(result);
//        verify(userResource).resetPassword(any(CredentialRepresentation.class));
//    }
//
//    @Test
//    void updatePassword_shouldThrowWhenOldPasswordInvalid() {
//        User testUser = new User();
//        testUser.setEmail("email@test.com");
//
//        PasswordRequest req = new PasswordRequest();
//        req.setOldPassword("old");
//
//        UserServiceImpl spy = spy(service);
//        doReturn(false).when(spy).verifyOldPassword("email@test.com", "old");
//
//        assertThrows(IllegalArgumentException.class, () -> spy.updatePassword(req, testUser));
//    }
//}