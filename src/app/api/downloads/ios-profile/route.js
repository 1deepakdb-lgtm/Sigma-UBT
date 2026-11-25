import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Generates an Apple iOS Configuration Profile (.mobileconfig) with a WebClip payload
 * so iPhone/iPad users can download and install ExamJK directly onto their Home Screen.
 */
export async function GET(request) {
  try {
    const host = request.headers.get('host') || 'examjk.com';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const portalUrl = host.includes('localhost') ? `${proto}://${host}` : 'https://examjk.com';

    let iconBase64 = '';
    const iconCandidates = [
      path.join(process.cwd(), 'public', 'apple-touch-icon.png'),
      path.join(process.cwd(), 'public', 'icon-192.png'),
    ];
    for (const candidate of iconCandidates) {
      if (fs.existsSync(candidate)) {
        iconBase64 = fs.readFileSync(candidate).toString('base64');
        break;
      }
    }

    const iconXml = iconBase64
      ? `      <key>Icon</key>\n      <data>\n${iconBase64.match(/.{1,68}/g)?.join('\n') || iconBase64}\n      </data>\n`
      : '';

    const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
${iconXml}      <key>IgnoreManifestScope</key>
      <false/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>ExamJK</string>
      <key>PayloadDescription</key>
      <string>Installs the ExamJK UBT Practice &amp; Learning App on your iPhone or iPad Home Screen.</string>
      <key>PayloadDisplayName</key>
      <string>ExamJK App</string>
      <key>PayloadIdentifier</key>
      <string>com.examjk.webclip.app</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>8A4F2C10-5E9B-4D3A-9F12-EXAMJK000001</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${portalUrl}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Install ExamJK (EPS-TOPIK UBT &amp; Smart Learning) as a full-screen app on iPhone and iPad.</string>
  <key>PayloadDisplayName</key>
  <string>ExamJK iPhone App</string>
  <key>PayloadIdentifier</key>
  <string>com.examjk.profile</string>
  <key>PayloadOrganization</key>
  <string>ExamJK.com</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>8A4F2C10-5E9B-4D3A-9F12-EXAMJK000002</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`;

    return new NextResponse(mobileconfig, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ExamJK-iOS.mobileconfig"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Failed to generate iOS mobileconfig:', err);
    return NextResponse.json({ error: 'Failed to generate iOS install profile' }, { status: 500 });
  }
}
