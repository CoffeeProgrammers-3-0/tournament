package com.project.backend.mappers;

import com.project.backend.dto.category.CategoryRequest;
import com.project.backend.dto.category.CategoryResponse;
import com.project.backend.models.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {CriteriaMapper.class})
public interface CategoryMapper {
    Category fromRequestToCategory(CategoryRequest categoryRequest);

    CategoryResponse fromCategoryToResponse(Category category);
}
