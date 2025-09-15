package com.poly.restaurant.entities;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "combo_dishes") 
public class ComboDishEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Liên kết với ComboEntity
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "combo_id", nullable = false) 
    @NotNull(message = "Combo không được để trống")
    @JsonBackReference
    private ComboEntity combo;

    // Liên kết với DishEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false) 
    @NotNull(message = "Món ăn không được để trống")
    private DishEntity dish; 
    
    @Column(nullable = false)
    private int quantity;
}