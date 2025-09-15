package com.poly.restaurant.entities.enums;

public enum BranchStatus {
    CLOSED("Đóng cửa vĩnh viễn"),   // Chi nhánh đóng cửa vĩnh viễn
    INACTIVE("Dừng hoạt động"),     // Chi nhánh tạm ngưng hoạt động
    MAINTENANCE("Bảo trì"),         // Chi nhánh đang bảo trì
    OPEN("Mở cửa");                 // Chi nhánh đang hoạt động bình thường

    private final String displayName;

    BranchStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Kiểm tra trạng thái hoạt động
    public boolean isOpen() {
        return this == OPEN;
    }

    public boolean isInactive() {
        return this == INACTIVE;
    }

    public boolean isMaintenance() {
        return this == MAINTENANCE;
    }

    public boolean isClosed() {
        return this == CLOSED;
    }

    // Kiểm tra chi nhánh có thể hoạt động không
    public boolean canOperate() {
        return this == OPEN;
    }
}

