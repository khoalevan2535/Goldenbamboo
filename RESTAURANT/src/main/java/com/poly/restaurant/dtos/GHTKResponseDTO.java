package com.poly.restaurant.dtos;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
public class GHTKResponseDTO {
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("order")
    private GHTKOrderDTO order;
    
    @JsonProperty("fee")
    private GHTKFeeDTO fee;
    
    @JsonProperty("data")
    private List<GHTKAddressDTO> data;
    
    @JsonProperty("error")
    private GHTKErrorDTO error;
}

@Data
class GHTKOrderDTO {
    @JsonProperty("label_id")
    private String labelId;
    
    @JsonProperty("partner_id")
    private String partnerId;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("created")
    private String created;
    
    @JsonProperty("message")
    private String message;
}

@Data
class GHTKFeeDTO {
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("fee")
    private Integer fee;
    
    @JsonProperty("insurance_fee")
    private Integer insuranceFee;
    
    @JsonProperty("include_vat")
    private String includeVat;
    
    @JsonProperty("cost_id")
    private String costId;
    
    @JsonProperty("delivery_type")
    private String deliveryType;
    
    @JsonProperty("a")
    private Integer a;
    
    @JsonProperty("dt")
    private String dt;
    
    @JsonProperty("ship_fee_only")
    private Integer shipFeeOnly;
    
    @JsonProperty("promotion_key")
    private String promotionKey;
}

@Data
class GHTKErrorDTO {
    @JsonProperty("code")
    private Integer code;
    
    @JsonProperty("message")
    private String message;
}
