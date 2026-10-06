package com.hassam.portfolio.contact;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param recipient inbox that receives contact-form messages
 * @param sender    address the mail is sent from; must be allowed by the SMTP account
 */
@ConfigurationProperties(prefix = "portfolio.contact")
public record ContactProperties(String recipient, String sender) {
}
