from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


def send_email(to: str, subject: str, body: str, html: Optional[str] = None) -> None:
    """Send an email using configured SMTP settings or print to console when disabled.

    This is intentionally simple: in production you should use a robust async email
    delivery service (SES, SendGrid, Mailgun, etc.).
    """
    if not settings.email_enabled or not settings.smtp_host or not settings.smtp_from:
        # Development fallback: log to console
        print("--- email disabled; printing message ---")
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print(body)
        if html:
            print("[HTML]")
            print(html)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = str(settings.smtp_from)
    msg["To"] = to
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")

    port = int(settings.smtp_port or 587)
    if port == 465:
        server = smtplib.SMTP_SSL(settings.smtp_host, port)
    else:
        server = smtplib.SMTP(settings.smtp_host, port)
        server.starttls()

    try:
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    finally:
        server.quit()
