package com.poly.restaurant.dto;

import java.util.List;

public class GHTKOrderRequest {
    private List<GHTKProduct> products;
    private GHTKOrderInfo order;

    // Constructors
    public GHTKOrderRequest() {}

    public GHTKOrderRequest(List<GHTKProduct> products, GHTKOrderInfo order) {
        this.products = products;
        this.order = order;
    }

    // Getters and Setters
    public List<GHTKProduct> getProducts() {
        return products;
    }

    public void setProducts(List<GHTKProduct> products) {
        this.products = products;
    }

    public GHTKOrderInfo getOrder() {
        return order;
    }

    public void setOrder(GHTKOrderInfo order) {
        this.order = order;
    }

    // Inner classes
    public static class GHTKProduct {
        private String name;
        private double weight;
        private int quantity;
        private int price;
        private String product_code;

        // Constructors
        public GHTKProduct() {}

        public GHTKProduct(String name, int weight, int quantity, int price) {
            this.name = name;
            this.weight = weight;
            this.quantity = quantity;
            this.price = price;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getWeight() {
            return weight;
        }

        public void setWeight(double weight) {
            this.weight = weight;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public int getPrice() {
            return price;
        }

        public void setPrice(int price) {
            this.price = price;
        }

        public String getProduct_code() {
            return product_code;
        }

        public void setProduct_code(String product_code) {
            this.product_code = product_code;
        }
    }

    public static class GHTKOrderInfo {
        private String id;
        private String booking_id;
        private String pick_name;
        private String pick_address;
        private String pick_province;
        private String pick_district;
        private String pick_ward;
        private String pick_tel;
        private String name;
        private String address;
        private String province;
        private String district;
        private String ward;
        private String hamlet;
        private String tel;
        private String note;
        private int value;
        private String transport;
        private String pick_option;
        private String deliver_option;
        private String is_freeship;
        private int pick_money;
        private String pick_date;

        // Constructors
        public GHTKOrderInfo() {}

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getBooking_id() {
            return booking_id;
        }

        public void setBooking_id(String booking_id) {
            this.booking_id = booking_id;
        }

        public String getPick_name() {
            return pick_name;
        }

        public void setPick_name(String pick_name) {
            this.pick_name = pick_name;
        }

        public String getPick_address() {
            return pick_address;
        }

        public void setPick_address(String pick_address) {
            this.pick_address = pick_address;
        }

        public String getPick_province() {
            return pick_province;
        }

        public void setPick_province(String pick_province) {
            this.pick_province = pick_province;
        }

        public String getPick_district() {
            return pick_district;
        }

        public void setPick_district(String pick_district) {
            this.pick_district = pick_district;
        }

        public String getPick_ward() {
            return pick_ward;
        }

        public void setPick_ward(String pick_ward) {
            this.pick_ward = pick_ward;
        }

        public String getPick_tel() {
            return pick_tel;
        }

        public void setPick_tel(String pick_tel) {
            this.pick_tel = pick_tel;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getWard() {
            return ward;
        }

        public void setWard(String ward) {
            this.ward = ward;
        }

        public String getHamlet() {
            return hamlet;
        }

        public void setHamlet(String hamlet) {
            this.hamlet = hamlet;
        }

        public String getTel() {
            return tel;
        }

        public void setTel(String tel) {
            this.tel = tel;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }

        public int getValue() {
            return value;
        }

        public void setValue(int value) {
            this.value = value;
        }

        public String getTransport() {
            return transport;
        }

        public void setTransport(String transport) {
            this.transport = transport;
        }

        public String getPick_option() {
            return pick_option;
        }

        public void setPick_option(String pick_option) {
            this.pick_option = pick_option;
        }

        public String getDeliver_option() {
            return deliver_option;
        }

        public void setDeliver_option(String deliver_option) {
            this.deliver_option = deliver_option;
        }

        public String getIs_freeship() {
            return is_freeship;
        }

        public void setIs_freeship(String is_freeship) {
            this.is_freeship = is_freeship;
        }

        public int getPick_money() {
            return pick_money;
        }

        public void setPick_money(int pick_money) {
            this.pick_money = pick_money;
        }

        public String getPick_date() {
            return pick_date;
        }

        public void setPick_date(String pick_date) {
            this.pick_date = pick_date;
        }
    }
}
