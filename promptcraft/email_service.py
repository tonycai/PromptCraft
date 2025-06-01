import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from promptcraft.logger_config import setup_logger

logger = setup_logger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.mandrillapp.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_use_tls = os.getenv("SMTP_USE_TLS", "True").lower() == "true"
        self.from_email = os.getenv("FROM_EMAIL", "promptcraft@aiw3.ai")
        self.from_name = os.getenv("FROM_NAME", "PromptCraft")
        
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """
        Send an email using Mailchimp/Mandrill SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text content if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_use_tls:
                    server.starttls()
                
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, email: str, verification_link: str) -> bool:
        """
        Send email verification email
        
        Args:
            email: User's email address
            verification_link: Link to verify email
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        subject = "Verify your PromptCraft account"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to PromptCraft!</h1>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Thank you for signing up for PromptCraft. To complete your registration and start using our platform, please verify your email address by clicking the button below.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_link}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    If the button doesn't work, you can copy and paste the following link into your browser:
                </p>
                <p style="color: #007bff; word-break: break-all; font-size: 14px;">
                    {verification_link}
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This verification link will expire in 24 hours. If you didn't create an account with PromptCraft, you can safely ignore this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to PromptCraft!
        
        Thank you for signing up. Please verify your email address by visiting:
        {verification_link}
        
        This verification link will expire in 24 hours.
        
        If you didn't create an account with PromptCraft, you can safely ignore this email.
        """
        
        return self.send_email(email, subject, html_content, text_content)

# Global instance
email_service = EmailService()