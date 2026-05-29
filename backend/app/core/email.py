from __future__ import annotations

import smtplib
import threading
from email.message import EmailMessage
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


def _send_email_sync(to: str, subject: str, body: str, html: Optional[str] = None) -> None:
    """Internal function to send email synchronously."""
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
        server = smtplib.SMTP_SSL(settings.smtp_host, port, timeout=5)
    else:
        server = smtplib.SMTP(settings.smtp_host, port, timeout=5)
        server.starttls()

    try:
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    finally:
        server.quit()


def send_email(to: str, subject: str, body: str, html: Optional[str] = None) -> None:
    """Send an email asynchronously in a background thread.

    This prevents email sending from blocking the main request. In production,
    use a robust async email service (SES, SendGrid, Mailgun, etc.).
    """
    thread = threading.Thread(target=_send_email_sync, args=(to, subject, body, html), daemon=True)
    thread.start()
