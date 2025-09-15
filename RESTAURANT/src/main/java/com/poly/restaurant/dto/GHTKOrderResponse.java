package com.poly.restaurant.dto;

public class GHTKOrderResponse {
    private boolean success;
    private String message;
    private GHTKOrder order;

    // Constructors
    public GHTKOrderResponse() {}

    public GHTKOrderResponse(boolean success, String message, GHTKOrder order) {
        this.success = success;
        this.message = message;
        this.order = order;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public GHTKOrder getOrder() {
        return order;
    }

    public void setOrder(GHTKOrder order) {
        this.order = order;
    }

    // Inner class
    public static class GHTKOrder {
        private String label;
        private String partner_id;
        private String status;
        private String message;

        // Constructors
        public GHTKOrder() {}

        public GHTKOrder(String label, String partner_id, String status, String message) {
            this.label = label;
            this.partner_id = partner_id;
            this.status = status;
            this.message = message;
        }

        // Getters and Setters
        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getPartner_id() {
            return partner_id;
        }

        public void setPartner_id(String partner_id) {
            this.partner_id = partner_id;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
