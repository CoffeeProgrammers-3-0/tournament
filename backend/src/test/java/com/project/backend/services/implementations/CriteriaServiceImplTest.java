//package com.project.backend.services.implementations;
//
//import com.project.backend.models.Category;
//import com.project.backend.models.Criteria;
//import com.project.backend.repositories.CategoryRepository;
//import com.project.backend.repositories.CriteriaRepository;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class CriteriaServiceImplTest {
//
//    @Mock
//    private CriteriaRepository criteriaRepository;
//
//    @Mock
//    private CategoryRepository categoryRepository;
//
//    @InjectMocks
//    private CriteriaServiceImpl criteriaService;
//
//    @Test
//    void create_shouldAttachCategoryAndSaveCriteria() {
//
//        Long categoryId = 1L;
//        String text = "Test criteria";
//
//        Category category = new Category();
//        category.setId(categoryId);
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
//        when(criteriaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//        Criteria result = criteriaService.create(categoryId, text);
//
//        assertNotNull(result);
//        assertEquals(text, result.getText());
//        assertEquals(category, result.getCategory());
//
//        ArgumentCaptor<Criteria> captor = ArgumentCaptor.forClass(Criteria.class);
//        verify(criteriaRepository).save(captor.capture());
//
//        Criteria saved = captor.getValue();
//        assertEquals(text, saved.getText());
//        assertEquals(category, saved.getCategory());
//
//        verify(categoryRepository).findById(categoryId);
//        verifyNoMoreInteractions(categoryRepository, criteriaRepository);
//    }
//
//    @Test
//    void create_shouldThrowException_whenCategoryNotFound() {
//
//        Long categoryId = 1L;
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class,
//                () -> criteriaService.create(categoryId, "text"));
//
//        verify(categoryRepository).findById(categoryId);
//        verifyNoInteractions(criteriaRepository);
//    }
//
//    @Test
//    void update_shouldChangeTextAndSave() {
//
//        Long criteriaId = 1L;
//
//        Criteria existing = new Criteria();
//        existing.setId(criteriaId);
//        existing.setText("Old text");
//
//        String newText = "New text";
//
//        when(criteriaRepository.findById(criteriaId)).thenReturn(Optional.of(existing));
//        when(criteriaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//        Criteria result = criteriaService.update(criteriaId, newText);
//
//        assertEquals(newText, result.getText());
//
//        verify(criteriaRepository).findById(criteriaId);
//        verify(criteriaRepository).save(existing);
//        verifyNoMoreInteractions(criteriaRepository);
//    }
//
//    @Test
//    void update_shouldThrowException_whenCriteriaNotFound() {
//
//        Long criteriaId = 1L;
//
//        when(criteriaRepository.findById(criteriaId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class,
//                () -> criteriaService.update(criteriaId, "text"));
//
//        verify(criteriaRepository).findById(criteriaId);
//        verifyNoMoreInteractions(criteriaRepository);
//    }
//
//    @Test
//    void delete_shouldDeleteExistingCriteria() {
//
//        Long criteriaId = 1L;
//
//        Criteria criteria = new Criteria();
//        criteria.setId(criteriaId);
//
//        when(criteriaRepository.findById(criteriaId)).thenReturn(Optional.of(criteria));
//
//        criteriaService.delete(criteriaId);
//
//        verify(criteriaRepository).findById(criteriaId);
//        verify(criteriaRepository).delete(criteria);
//        verifyNoMoreInteractions(criteriaRepository);
//    }
//
//    @Test
//    void delete_shouldThrowException_whenCriteriaNotFound() {
//
//        Long criteriaId = 1L;
//
//        when(criteriaRepository.findById(criteriaId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class,
//                () -> criteriaService.delete(criteriaId));
//
//        verify(criteriaRepository).findById(criteriaId);
//        verifyNoMoreInteractions(criteriaRepository);
//    }
//}