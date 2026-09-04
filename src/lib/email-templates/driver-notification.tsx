import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface BrandInput {
  appName?: string
  logoUrl?: string | null
  headerImageUrl?: string | null
  primaryColor?: string | null
  footerText?: string | null
}

interface DriverNotificationProps {
  heading?: string
  body?: string
  footer?: string | null
  preview?: string
  brand?: BrandInput
}

const DEFAULT_PRIMARY_COLOR = '#93032E'
const DEFAULT_LOGO_URL = 'https://pub-38b5d7ad707f4398a808e413bb3620c8.r2.dev/kruh/logo.png'
const APP_URL = 'https://kruhzivljenja.kalvarija.si'

interface DutyItem {
  icon: string
  label: string
  value: string
}

const DUTY_ROW_REGEX = /^\s*(Datum|Date|Lokacija|Location|Razdeljevalec(?:\/ka)?|Koordinator(?:\/ica)?|Distributor|Coordinator|Voznik(?:\/ica)?|Driver|Čas|Ura|Time|Prejemniki|Recipients):\s*(.+)$/i

function getIconForLabel(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('datum') || l.includes('date')) return '📅'
  if (l.includes('lokacij') || l.includes('location')) return '📍'
  if (l.includes('razdeljev') || l.includes('koordinat') || l.includes('distribut') || l.includes('coordinat')) return '📋'
  if (l.includes('voznik') || l.includes('driver')) return '🚚'
  if (l.includes('čas') || l.includes('ura') || l.includes('time')) return '⏰'
  if (l.includes('prejemnik') || l.includes('recipient')) return '👥'
  return '🔹'
}

function parseEmailBody(rawBody: string) {
  const lines = rawBody.split('\n')
  const dutyItems: DutyItem[] = []
  const beforeDuty: string[] = []
  const afterDuty: string[] = []

  let foundDuty = false
  let finishedDuty = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const match = line.match(DUTY_ROW_REGEX)

    if (match) {
      foundDuty = true
      const rawLabel = match[1]
      const rawVal = match[2]
      dutyItems.push({
        label: rawLabel,
        value: rawVal,
        icon: getIconForLabel(rawLabel),
      })
    } else if (!foundDuty) {
      beforeDuty.push(line)
    } else {
      finishedDuty = true
      afterDuty.push(line)
    }
  }

  // Deduplicate sign-offs from afterDuty (e.g. trailing "Lep pozdrav", "Kruh življenja")
  const isSignOffLine = (l: string) => {
    const lower = l.toLowerCase().trim()
    return (
      lower.startsWith('lep pozdrav') ||
      lower.startsWith('best regards') ||
      lower.startsWith('prijazen pozdrav') ||
      lower === 'kruh življenja' ||
      lower === 'kruh zivljenja' ||
      lower === 'ekipa kck' ||
      lower === 'ekipa kalvarija'
    )
  }

  while (afterDuty.length > 0 && afterDuty[afterDuty.length - 1] === '') {
    afterDuty.pop()
  }
  while (afterDuty.length > 0 && isSignOffLine(afterDuty[afterDuty.length - 1])) {
    afterDuty.pop()
  }
  while (afterDuty.length > 0 && afterDuty[afterDuty.length - 1] === '') {
    afterDuty.pop()
  }

  // Deduplicate sign-offs from beforeDuty if there were no duty items (e.g. test email)
  if (dutyItems.length === 0) {
    while (beforeDuty.length > 0 && beforeDuty[beforeDuty.length - 1] === '') {
      beforeDuty.pop()
    }
    while (beforeDuty.length > 0 && isSignOffLine(beforeDuty[beforeDuty.length - 1])) {
      beforeDuty.pop()
    }
    while (beforeDuty.length > 0 && beforeDuty[beforeDuty.length - 1] === '') {
      beforeDuty.pop()
    }
  }

  return { beforeDuty, dutyItems, afterDuty }
}

export const DriverNotificationEmail = ({
  heading = 'Obvestilo',
  body = '',
  footer = null,
  preview = 'KRUH ŽIVLJENJA — obvestilo',
  brand = {},
}: DriverNotificationProps) => {
  const appName = brand.appName || 'KRUH ŽIVLJENJA'
  const primaryColor = brand.primaryColor && brand.primaryColor !== '#0a0a0a'
    ? brand.primaryColor
    : DEFAULT_PRIMARY_COLOR
  // Ensure we use the working Cloudflare R2 logo URL if brand.logoUrl is null, empty, or outdated
  const logoUrl =
    brand.logoUrl && !brand.logoUrl.includes('kruhzivljenja.kalvarija.si/kruh-logo.png')
      ? brand.logoUrl
      : DEFAULT_LOGO_URL

  const { beforeDuty, dutyItems, afterDuty } = parseEmailBody(body)

  const ctaUrl = `${APP_URL}/planner`
  const ctaText = '🍞 Odpri Načrtovalec'

  const signOff = (footer ?? brand.footerText ?? 'Lep pozdrav,\nKruh življenja')
    .split('\n')
    .filter(Boolean)

  return (
    <Html lang="sl" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={mainBody}>
        {/* Outer Wrapper Table */}
        <table
          width="100%"
          border={0}
          cellSpacing={0}
          cellPadding={0}
          style={outerTable}
        >
          <tbody>
            <tr>
              <td align="center">
                {/* Main Card */}
                <table
                  width="100%"
                  border={0}
                  cellSpacing={0}
                  cellPadding={0}
                  style={cardContainer}
                >
                  <tbody>
                    {/* Header Banner */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: primaryColor,
                          padding: '28px 24px 24px 24px',
                          textAlign: 'center',
                          borderTopLeftRadius: '16px',
                          borderTopRightRadius: '16px',
                        }}
                      >
                        {/* Logo inside soft white container */}
                        <table
                          border={0}
                          cellSpacing={0}
                          cellPadding={0}
                          style={{ margin: '0 auto 12px auto' }}
                        >
                          <tbody>
                            <tr>
                              <td
                                align="center"
                                style={{
                                  backgroundColor: '#ffffff',
                                  borderRadius: '12px',
                                  padding: '8px',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                                  width: '48px',
                                  height: '48px',
                                }}
                              >
                                <img
                                  src={logoUrl}
                                  alt={appName}
                                  width="48"
                                  height="48"
                                  style={{
                                    display: 'block',
                                    width: '48px',
                                    height: '48px',
                                    border: 0,
                                    borderRadius: '6px',
                                  }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Banner App Title */}
                        <h1
                          style={{
                            margin: '0',
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          }}
                        >
                          {appName}
                        </h1>

                        {/* Banner Subtitle */}
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            color: '#fed7aa',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          }}
                        >
                          Krščanska cerkev Kalvarija • Služba razdeljevanja hrane
                        </p>
                      </td>
                    </tr>

                    {/* Optional Header Hero Image */}
                    {brand.headerImageUrl ? (
                      <tr>
                        <td>
                          <img
                            src={brand.headerImageUrl}
                            alt=""
                            width="580"
                            style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                          />
                        </td>
                      </tr>
                    ) : null}

                    {/* Content Section */}
                    <tr>
                      <td style={contentTd}>
                        {/* Heading */}
                        {heading ? (
                          <h2 style={{ ...headingStyle, color: primaryColor }}>
                            {heading}
                          </h2>
                        ) : null}

                        {/* Body Lines Before Duty Card */}
                        {beforeDuty.map((line, i) =>
                          line === '' ? (
                            <div key={`b${i}`} style={{ height: 10 }} />
                          ) : (
                            <p key={`b${i}`} style={paragraphStyle}>
                              {line}
                            </p>
                          ),
                        )}

                        {/* Duty Highlight Card (Nedelja Style) */}
                        {dutyItems.length > 0 ? (
                          <div style={dutyCardStyle}>
                            <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
                              <tbody>
                                {dutyItems.map((item, idx) => (
                                  <tr key={`duty-${idx}`}>
                                    <td
                                      style={{
                                        padding: '6px 0',
                                        fontSize: '15px',
                                        color: '#78350f',
                                        verticalAlign: 'top',
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                                      }}
                                    >
                                      <span style={{ marginRight: '8px', fontSize: '16px' }}>
                                        {item.icon}
                                      </span>
                                      <strong style={{ color: '#92400e', fontWeight: 700 }}>
                                        {item.label}:
                                      </strong>{' '}
                                      <span style={{ color: '#1e293b', fontWeight: 600 }}>
                                        {item.value}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {/* Body Lines After Duty Card */}
                        {afterDuty.map((line, i) =>
                          line === '' ? (
                            <div key={`a${i}`} style={{ height: 10 }} />
                          ) : (
                            <p key={`a${i}`} style={paragraphStyle}>
                              {line}
                            </p>
                          ),
                        )}

                        {/* Call to Action Button */}
                        <div style={{ textAlign: 'center', margin: '26px 0 18px 0' }}>
                          <a
                            href={ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              ...ctaButtonStyle,
                              backgroundColor: primaryColor,
                            }}
                          >
                            {ctaText}
                          </a>
                        </div>

                        {/* Scripture Card (Jesus is the Bread of Life) */}
                        <div style={scriptureCardStyle}>
                          <div style={{ ...scriptureBadgeStyle, color: primaryColor }}>
                            JANEZ 6,35
                          </div>
                          <p style={scriptureTextStyle}>
                            »Jezus jim je rekel: 'Jaz sem kruh življenja. Kdor pride k meni, ne bo lačen, in kdor vame veruje, ne bo nikoli žejen.'«
                          </p>
                          <p style={scriptureMottoStyle}>
                            »Zastonj ste prejeli, zastonj dajte.« (Matej 10,8)
                          </p>
                        </div>

                        {/* Clean Single Sign-Off */}
                        <div style={{ marginTop: '22px' }}>
                          {signOff.map((sLine, sIdx) => (
                            <p key={`sign-${sIdx}`} style={signOffStyle}>
                              {sLine}
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Bottom Sub-footer Note */}
                    <tr>
                      <td style={subFooterTd}>
                        <p style={subFooterMain}>
                          Krščanska cerkev Kalvarija • Kruh Življenja
                        </p>
                        <p style={subFooterSub}>
                          <a
                            href={APP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: primaryColor, textDecoration: 'none', fontWeight: 600 }}
                          >
                            kruhzivljenja.kalvarija.si
                          </a>
                          {' • '}
                          Avtomatsko obvestilo sistema
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  )
}

export const template = {
  component: DriverNotificationEmail,
  subject: (data: Record<string, any>) =>
    (data?.subject as string) || 'KRUH ŽIVLJENJA',
  displayName: 'Driver notification',
  previewData: {
    subject: 'Nov razpored prevoza — 15. 1. 2026',
    heading: 'Nov razpored prevoza',
    body: 'Pozdravljen/a Janez,\n\ndodeljen/a si kot voznik/ica za prevzem hrane:\n\nDatum: 15. 1. 2026\nLokacija: Mercator Celje\nRazdeljevalec/ka: Ana Novak\n\nHvala za tvojo pomoč!',
    footer: 'Lep pozdrav,\nKruh življenja',
    preview: 'Nova dodelitev za 15. 1. 2026',
  },
} satisfies TemplateEntry

// Inline CSS styles engineered for email client compatibility
const mainBody: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: '#f8fafc',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: '#1e293b',
  lineHeight: '1.6',
}

const outerTable: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '24px 12px',
}

const cardContainer: React.CSSProperties = {
  maxWidth: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
}

const contentTd: React.CSSProperties = {
  padding: '30px 28px 24px 28px',
}

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  margin: '0 0 18px 0',
  lineHeight: '1.3',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#334155',
  margin: '0 0 12px 0',
  lineHeight: '1.6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const dutyCardStyle: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '12px',
  padding: '16px 18px',
  margin: '18px 0 20px 0',
}

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  padding: '12px 26px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(147, 3, 46, 0.25)',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const scriptureCardStyle: React.CSSProperties = {
  margin: '26px 0 18px 0',
  backgroundColor: '#faf7f5',
  border: '1px solid #f1e5e7',
  borderLeft: '4px solid #93032E',
  borderRadius: '10px',
  padding: '16px 18px',
  textAlign: 'center',
}

const scriptureBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '6px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const scriptureTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  fontStyle: 'italic',
  color: '#374151',
  lineHeight: '1.6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const scriptureMottoStyle: React.CSSProperties = {
  margin: '6px 0 0 0',
  fontSize: '11px',
  color: '#9ca3af',
  fontStyle: 'italic',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const signOffStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 4px 0',
  lineHeight: '1.5',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const subFooterTd: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '14px 24px',
  textAlign: 'center',
}

const subFooterMain: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748b',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const subFooterSub: React.CSSProperties = {
  margin: '4px 0 0 0',
  fontSize: '11px',
  color: '#94a3b8',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

