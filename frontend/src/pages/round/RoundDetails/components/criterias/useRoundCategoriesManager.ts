import {useCallback, useState} from "react";
import {categoryService} from "../../../../services/impl/CategoryService";
import {criteriaService} from "../../../../services/impl/CriteriaService";

export const useRoundCategoriesManager = ({
                                              roundId,
                                              fetchCategories,
                                              clearErrors,
                                              handleError,
                                              triggerConfirm,
                                              closeConfirm,
                                          }: any) => {

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);

    const [newCategoryData, setNewCategoryData] = useState({ title: "", weight: 0.1 });
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [newCriteriaText, setNewCriteriaText] = useState("");

    const handleAddCategory = useCallback(async () => {
        clearErrors();
        try {
            await categoryService.createCategory(roundId, newCategoryData);
            setCategoryModalOpen(false);
            setNewCategoryData({ title: "", weight: 0.1 });
            await fetchCategories();
        } catch (e) {
            handleError(e, "Помилка створення категорії");
        }
    }, [newCategoryData]);

    const handleDeleteCategory = useCallback((id: number) => {
        triggerConfirm({
            title: "Delete category?",
            description: "This will delete all criteria",
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await categoryService.deleteCategory(roundId, id);
                    await fetchCategories();
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка видалення категорії");
                }
            }
        });
    }, []);

    const handleAddCriteria = useCallback(async () => {
        if (!selectedCategoryId) return;

        clearErrors();
        try {
            await criteriaService.createCriteria(selectedCategoryId, { text: newCriteriaText });
            setCriteriaModalOpen(false);
            setNewCriteriaText("");
            await fetchCategories();
        } catch (e) {
            handleError(e, "Помилка створення критерію");
        }
    }, [selectedCategoryId, newCriteriaText]);

    const handleDeleteCriteria = useCallback((categoryId: number, criteriaId: number) => {
        triggerConfirm({
            title: "Delete criteria?",
            description: "",
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await criteriaService.deleteCriteria(categoryId, criteriaId);
                    await fetchCategories();
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка видалення");
                }
            }
        });
    }, []);

    return {
        categoryModalOpen, setCategoryModalOpen,
        criteriaModalOpen, setCriteriaModalOpen,

        newCategoryData, setNewCategoryData,
        selectedCategoryId, setSelectedCategoryId,
        newCriteriaText, setNewCriteriaText,

        handleAddCategory,
        handleDeleteCategory,
        handleAddCriteria,
        handleDeleteCriteria,
    };
};