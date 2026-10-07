package com.hassam.portfolio.content;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectCategory {
    WEB, MOBILE, DESKTOP;

    @JsonValue
    public String id() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ProjectCategory fromId(String id) {
        return valueOf(id.trim().toUpperCase());
    }
}
