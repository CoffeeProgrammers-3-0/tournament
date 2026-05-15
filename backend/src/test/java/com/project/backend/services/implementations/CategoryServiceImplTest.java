//package com.project.backend.services.implementations;
//
//import com.project.backend.models.Category;
//import com.project.backend.models.Round;
//import com.project.backend.repositories.CategoryRepository;
//import com.project.backend.repositories.RoundRepository;
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
//class CategoryServiceImplTest {
//
//    @Mock
//    private CategoryRepository categoryRepository;
//
//    @Mock
//    private RoundRepository roundRepository;
//
//    @InjectMocks
//    private CategoryServiceImpl categoryService;
//
//    @Test
//    void create_shouldAttachRoundAndSaveCategory() {
//
//        Long roundId = 1L;
//
//        Round round = new Round();
//        round.setId(roundId);
//
//        Category category = new Category();
//        category.setTitle("Test");
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));
//        when(categoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//        Category result = categoryService.create(roundId, category);
//
//        assertNotNull(result);
//        assertEquals(round, result.getRound());
//
//        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
//        verify(categoryRepository).save(captor.capture());
//
//        Category saved = captor.getValue();
//        assertEquals(round, saved.getRound());
//        assertEquals("Test", saved.getTitle());
//
//        verify(roundRepository).findById(roundId);
//        verifyNoMoreInteractions(roundRepository, categoryRepository);
//    }
//
//    @Test
//    void create_shouldThrowException_whenRoundNotFound() {
//
//        Long roundId = 1L;
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.empty());
//
//        Category category = new Category();
//
//        assertThrows(EntityNotFoundException.class,
//                () -> categoryService.create(roundId, category));
//
//        verify(roundRepository).findById(roundId);
//        verifyNoInteractions(categoryRepository);
//    }
//
//    @Test
//    void update_shouldUpdateOnlyEditableFields() {
//
//        Long categoryId = 1L;
//
//        Category existing = new Category();
//        existing.setId(categoryId);
//        existing.setTitle("Old");
//        existing.setWeight(0.1);
//
//        Category newData = new Category();
//        newData.setTitle("New");
//        newData.setWeight(0.5);
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(existing));
//        when(categoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//        Category result = categoryService.update(categoryId, newData);
//
//        assertEquals("New", result.getTitle());
//        assertEquals(0.5, result.getWeight());
//
//        verify(categoryRepository).findById(categoryId);
//        verify(categoryRepository).save(existing);
//        verifyNoMoreInteractions(categoryRepository);
//    }
//
//    @Test
//    void update_shouldThrowException_whenCategoryNotFound() {
//
//        Long categoryId = 1L;
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class,
//                () -> categoryService.update(categoryId, new Category()));
//
//        verify(categoryRepository).findById(categoryId);
//        verifyNoMoreInteractions(categoryRepository);
//    }
//
//    @Test
//    void delete_shouldDeleteExistingCategory() {
//
//        Long categoryId = 1L;
//
//        Category category = new Category();
//        category.setId(categoryId);
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
//
//        categoryService.delete(categoryId);
//
//        verify(categoryRepository).findById(categoryId);
//        verify(categoryRepository).delete(category);
//        verifyNoMoreInteractions(categoryRepository);
//    }
//
//    @Test
//    void delete_shouldThrowException_whenCategoryNotFound() {
//
//        Long categoryId = 1L;
//
//        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class,
//                () -> categoryService.delete(categoryId));
//
//        verify(categoryRepository).findById(categoryId);
//        verifyNoMoreInteractions(categoryRepository);
//    }
//}