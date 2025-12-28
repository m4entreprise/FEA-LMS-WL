<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Certificate</title>
    <style>
        @page { margin: 28px; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
        }
        .border {
            border: 6px solid #111827;
            padding: 28px;
            height: 100%;
        }
        .inner {
            border: 2px solid #d1d5db;
            padding: 28px;
            height: 100%;
            text-align: center;
        }
        .title {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-top: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-top: 12px;
        }
        .name {
            font-size: 30px;
            font-weight: 700;
            margin-top: 22px;
        }
        .course {
            font-size: 20px;
            margin-top: 10px;
        }
        .body {
            font-size: 14px;
            line-height: 1.5;
            margin: 22px auto 0;
            max-width: 720px;
            color: #374151;
        }
        .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .badge {
            display: inline-block;
            border: 1px solid #111827;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            color: #111827;
        }
    </style>
</head>
<body>
    <div class="border">
        <div class="inner">
            <div class="title">
                {{ $course->certificate_title ?: 'Certificate of Completion' }}
            </div>

            <div class="subtitle">This certifies that</div>

            <div class="name">{{ $user->name }}</div>

            <div class="subtitle">has successfully completed the course</div>

            <div class="course"><strong>{{ $course->title }}</strong></div>

            <div class="body">
                {{ $course->certificate_body ?: 'Congratulations on completing this learning module. This certificate recognizes your dedication and achievement.' }}
            </div>

            <div class="footer">
                <div>
                    Issued: {{ optional($certificate->issued_at)->format('Y-m-d') }}
                </div>
                <div class="badge">
                    Certificate #{{ $certificate->certificate_number }}
                </div>
                <div>
                    Verification ID: {{ $certificate->uuid }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
