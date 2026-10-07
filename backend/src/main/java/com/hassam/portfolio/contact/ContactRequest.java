package com.hassam.portfolio.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @param website honeypot field: hidden in the form, so only bots fill it in.
 */
public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 150) String subject,
        @NotBlank @Size(min = 10, max = 5000) String message,
        String website) {

    public boolean isLikelySpam() {
        return website != null && !website.isBlank();
    }
}
