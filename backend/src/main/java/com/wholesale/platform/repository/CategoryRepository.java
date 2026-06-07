package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByNameAndDeletedFalse(String name);
    List<Category> findByParentIsNullAndDeletedFalse();
    List<Category> findByDeletedFalse();
    boolean existsByName(String name);
}
