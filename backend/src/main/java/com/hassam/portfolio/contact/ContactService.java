package com.hassam.portfolio.contact;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactProperties properties;
    private final ObjectProvider<JavaMailSender> mailSender;

    public ContactService(ContactProperties properties, ObjectProvider<JavaMailSender> mailSender) {
        this.properties = properties;
        this.mailSender = mailSender;
    }

    /**
     * Sends the message to the portfolio owner. When no SMTP server is configured
     * (spring.mail.host unset) the message is only logged, which keeps local
     * development working without credentials.
     */
    public void send(ContactRequest request) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(properties.recipient());
        mail.setFrom(properties.sender());
        // Reply goes to the visitor; "From" stays our own address so SPF/DMARC pass.
        mail.setReplyTo(request.email());
        mail.setSubject("[Portfolio] " + singleLine(request.subject()));
        mail.setText("""
                Name: %s
                Email: %s

                %s
                """.formatted(singleLine(request.name()), request.email(), request.message()));

        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("No SMTP server configured; contact message not emailed:\n{}", mail);
            return;
        }
        try {
            sender.send(mail);
        } catch (MailException e) {
            log.error("Failed to send contact message from {}", request.email(), e);
            throw new ContactDeliveryException(e);
        }
    }

    private static String singleLine(String value) {
        return value.replaceAll("[\\r\\n]+", " ").trim();
    }

    public static class ContactDeliveryException extends RuntimeException {
        ContactDeliveryException(Throwable cause) {
            super("Could not deliver contact message", cause);
        }
    }
}
