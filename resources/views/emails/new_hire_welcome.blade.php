<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Company!</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #EEF2F7;
            color: #111827;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
            padding: 40px 20px;
        }

        /* ── Wrapper ── */
        .wrapper {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
        }

        /* ── Brand seal ── */
        .brand-bar {
            text-align: center;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
        }
        .brand-rule {
            flex: 1;
            max-width: 60px;
            height: 1px;
            background: #C4CEDB;
        }
        .brand-monogram {
            width: 3rem;
            height: 3rem;
            border-radius: 9px;
            background: #4F46E5;
            color: #fff;
            font-size: 1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Georgia, serif;
            flex-shrink: 0;
        }

        /* ── Card ── */
        .card {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.07);
            width: 100%;
        }

        /* ── Card header ── */
        .card-header {
            background: linear-gradient(140deg, #312E81 0%, #4F46E5 55%, #6366F1 100%);
            padding: 36px 32px 32px;
            position: relative;
            overflow: hidden;
        }
        .card-header::before {
            content: '';
            position: absolute;
            top: -50px; right: -50px;
            width: 180px; height: 180px;
            border-radius: 50%;
            background: rgba(255,255,255,0.07);
            pointer-events: none;
        }
        .card-header::after {
            content: '';
            position: absolute;
            bottom: -70px; left: -30px;
            width: 220px; height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
            pointer-events: none;
        }
        .header-eyebrow {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        .header-title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 26px;
            font-weight: normal;
            color: #fff;
            line-height: 1.3;
            position: relative;
            z-index: 1;
        }
        .header-title strong {
            font-weight: bold;
            display: block;
        }
        .header-accent {
            width: 32px;
            height: 2px;
            background: rgba(255,255,255,0.4);
            border-radius: 2px;
            margin-top: 18px;
            position: relative;
            z-index: 1;
        }

        /* ── Card body ── */
        .card-body {
            padding: 32px;
        }

        .greeting {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 17px;
            color: #111827;
            margin-bottom: 10px;
        }
        .intro {
            font-size: 14px;
            color: #4B5563;
            line-height: 1.75;
            margin-bottom: 28px;
        }

        /* ── Section label ── */
        .section-label {
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            color: #9CA3AF;
            margin-bottom: 10px;
        }

        /* ── Credentials ── */
        .creds-box {
            background: #F8FAFF;
            border: 1px solid #DDE5F7;
            border-left: 3px solid #4F46E5;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 28px;
        }
        .cred-item {
            padding: 11px 18px;
            border-bottom: 1px solid #EEF2FF;
        }
        .cred-item:last-of-type {
            border-bottom: none;
        }
        .cred-key {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: #6B7280;
            margin-bottom: 3px;
        }
        .cred-val {
            font-size: 14px;
            color: #111827;
            font-weight: 500;
            word-break: break-word;
            overflow-wrap: anywhere;
        }
        .cred-val a {
            color: #4F46E5;
            text-decoration: none;
        }
        .creds-hint {
            padding: 11px 18px;
            background: #F0F4FF;
            border-top: 1px dashed #C7D2FE;
            font-size: 12px;
            color: #6B7280;
            line-height: 1.6;
            font-style: italic;
        }

        /* ── Steps ── */
        .steps {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-bottom: 30px;
        }
        .step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        .step-num {
            width: 22px;
            height: 22px;
            min-width: 22px;
            border-radius: 50%;
            background: #EEF2FF;
            color: #4F46E5;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
        }
        .step-text {
            font-size: 13.5px;
            color: #0d141eff;
            line-height: 1.65;
        }
        .step-text strong {
            color: #4e7ad8ff;
        }

        /* ── CTA ── */
        .cta-wrap {
            text-align: center;
            margin-bottom: 30px;
        }
        .cta-btn {
            display: inline-block;
            padding: 13px 40px;
            background: #fdfdffff;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.2px;
            box-shadow: 0 4px 14px rgba(79,70,229,0.28);
        }

        /* ── Sign-off ── */
        .signoff {
            border-top: 1px solid #F3F4F6;
            padding-top: 22px;
            font-size: 13.5px;
            color: #4B5563;
            line-height: 1.7;
        }
        .signoff p + p { margin-top: 4px; }
        .signoff .regards {
            font-family: Georgia, serif;
            color: #111827;
            font-size: 14px;
            margin-top: 12px;
        }
        .signoff .team {
            font-size: 12px;
            color: #9CA3AF;
        }

        /* ── Footer ── */
        .footer {
            text-align: center;
            margin-top: 22px;
            font-size: 11px;
            color: #9CA3AF;
            line-height: 1.6;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
            body { padding: 20px 12px; }
            .card-header { padding: 26px 20px 24px; }
            .header-title { font-size: 22px; }
            .card-body { padding: 24px 20px; }
            .creds-box { border-radius: 8px; }
            .cred-item { padding: 10px 14px; }
            .creds-hint { padding: 10px 14px; }
            .cta-btn { display: block; text-align: center; padding: 14px 20px; }
        }
    </style>
</head>
<body>
<div class="wrapper">

    <div class="card">

        <!-- Header -->
        <div class="card-header">
            <p class="header-eyebrow">Employee Onboarding</p>
            <h1 class="header-title">
                Welcome to
                <strong>the Company.</strong>
            </h1>
            <div class="header-accent"></div>
        </div>

        <!-- Body -->
        <div class="card-body">

            <p class="greeting">Hi {{ $user->name }},</p>
            <p class="intro">
                Your employee account is all set. Use the credentials below to log in for the first time — then follow the steps to set your own password.
            </p>

            <!-- Credentials -->
            <p class="section-label">Your Login Details</p>
            <div class="creds-box">
                <div class="cred-item">
                    <p class="cred-key">Login URL</p>
                    <p class="cred-val"><a href="{{ url('/') }}">{{ url('/') }}</a></p>
                </div>
                <div class="cred-item">
                    <p class="cred-key">Email</p>
                    <p class="cred-val">{{ $user->email }}</p>
                </div>
                <div class="cred-item">
                    <p class="cred-key">Temporary Password</p>
                    <p class="cred-val">{{ $generatedPassword }}</p>
                </div>
                <div class="creds-hint">
                    Password format: Name@BirthYear &nbsp;·&nbsp; e.g. <strong>John@1990</strong> for John Doe born in 1990.
                </div>
            </div>

            <!-- Steps -->
            <p class="section-label">Next Steps</p>
            <div class="steps">
                <div class="step">
                    <span class="step-num">1</span>
                    <span class="step-text">Click <strong>Log In Now</strong> below and sign in with the credentials above.</span>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <span class="step-text">Click your profile picture (top-right) and open <strong>My Profile</strong>.</span>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <span class="step-text">Scroll to <strong>Change Password</strong>, enter your temporary password, and choose a new secure one.</span>
                </div>
            </div>

            <!-- CTA -->
            <div class="cta-wrap">
                <a href="{{ url('/login') }}" class="cta-btn">Log In Now →</a>
            </div>

            <!-- Sign-off -->
            <div class="signoff">
                <p>Questions? Reach out to HR or the IT department — we're happy to help.</p>
                <p class="regards">Warm regards,</p>
                <p class="team">The HR Team</p>
            </div>

        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>

</div>
</body>
</html>