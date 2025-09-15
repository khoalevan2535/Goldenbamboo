package com.poly.restaurant.dtos;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class GHTKAddressDTO {
    
    @JsonProperty("pick_name")
    private String pickName;
    
    @JsonProperty("pick_address")
    private String pickAddress;
    
    @JsonProperty("pick_province")
    private String pickProvince;
    
    @JsonProperty("pick_district")
    private String pickDistrict;
    
    @JsonProperty("pick_ward")
    private String pickWard;
    
    @JsonProperty("pick_tel")
    private String pickTel;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("province")
    private String province;
    
    @JsonProperty("district")
    private String district;
    
    @JsonProperty("ward")
    private String ward;
    
    @JsonProperty("tel")
    private String tel;
    
    @JsonProperty("note")
    private String note;
    
    @JsonProperty("value")
    private Integer value;
    
    @JsonProperty("transport")
    private String transport;
    
    @JsonProperty("pick_option")
    private String pickOption;
    
    @JsonProperty("deliver_option")
    private String deliverOption;
}
