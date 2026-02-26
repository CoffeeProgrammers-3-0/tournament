package com.project.backend.services.interfaces;

import com.project.backend.dto.wrapper.PasswordRequest;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

public interface UserService {
    User createUserKeycloak(User user);

    User updateUser(User user, long userId);

    User updateUserKeycloak(User user, long userId);

    boolean updatePassword(PasswordRequest passwordRequest, User user);

    User findById(long id);

    User findUserByAuth(Authentication authentication);

    User findUserByEmail(String email);

    User findUserByKeycloakUserId(String keycloakUserId);

    boolean isNotExistByEmail(String email);

    void checkEmail(String email);

    User save(User user);

    void delete(Long userId);
    
    User createJury(User user);

    Page<User> findAllByRole(Integer page, Integer size, String query, Role role);
}
