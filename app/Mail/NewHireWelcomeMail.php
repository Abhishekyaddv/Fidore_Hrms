<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewHireWelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $generatedPassword;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $generatedPassword)
    {
        $this->user = $user;
        $this->generatedPassword = $generatedPassword;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to the Company! Your Login Details',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new_hire_welcome',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        // Log the failure to alert the administrator, including the generated password
        // so the user's credentials are not lost if the email fails.
        \Illuminate\Support\Facades\Log::error('Failed to send New Hire Welcome Mail.', [
            'user_id' => $this->user->id ?? null,
            'user_email' => $this->user->email ?? null,
            'generated_password' => $this->generatedPassword,
            'error' => $exception->getMessage(),
        ]);
    }
}
