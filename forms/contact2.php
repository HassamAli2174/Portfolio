<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "hassamarshad021@gmail.com";  // Replace with your actual email
    $name = htmlspecialchars(strip_tags(trim($_POST["name"])));
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars(strip_tags(trim($_POST["subject"])));
    $message = htmlspecialchars(strip_tags(trim($_POST["message"])));

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format";
        exit;
    }

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $full_message = "Name: $name\n";
    $full_message .= "Email: $email\n";
    $full_message .= "Message:\n$message\n";

    // Send email
    if (mail($to, $subject, $full_message, $headers)) {
        echo "OK"; // This response works with your existing JS validation
    } else {
        echo "Error sending message.";
    }
} else {
    echo "Invalid request method.";
}
?>
