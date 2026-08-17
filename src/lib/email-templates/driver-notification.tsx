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

const DriverNotificationEmail = ({
  heading = 'Obvestilo',
  body = '',
  footer = null,
  preview = 'KRUH ŽIVLJENJA — obvestilo',
  brand = {},
}: DriverNotificationProps) => {
  const appName = brand.appName || 'KRUH ŽIVLJENJA'
  const accent = brand.primaryColor || '#0a0a0a'
  const bodyLines = body.split('\n')
  const footerLines = (footer ?? brand.footerText ?? appName).split('\n')

  return (
    <Html lang="sl" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {brand.logoUrl ? (
            <Section style={{ marginBottom: 16 }}>
              <Img
                src={brand.logoUrl}
                alt={appName}
                height="48"
                style={{ height: 48, width: 'auto' }}
              />
            </Section>
          ) : null}
          {brand.headerImageUrl ? (
            <Section style={{ marginBottom: 20 }}>
              <Img
                src={brand.headerImageUrl}
                alt=""
                width="520"
                style={{ width: '100%', maxWidth: 520, height: 'auto', borderRadius: 6 }}
              />
            </Section>
          ) : null}
          <Heading style={{ ...h1, color: accent }}>{heading}</Heading>
          {bodyLines.map((line, i) =>
            line.trim() === '' ? (
              <div key={`b${i}`} style={{ height: 12 }} />
            ) : (
              <Text key={`b${i}`} style={text}>
                {line}
              </Text>
            ),
          )}
          <div style={{ height: 24 }} />
          {footerLines.map((line, i) =>
            line.trim() === '' ? (
              <div key={`f${i}`} style={{ height: 8 }} />
            ) : (
              <Text key={`f${i}`} style={footerStyle}>
                {line}
              </Text>
            ),
          )}
        </Container>
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
    subject: 'Nov razpored prevoza — 2026-01-15',
    heading: 'Nov razpored prevoza',
    body: 'Pozdravljen Janez,\n\ndodeljen si kot voznik za prevzem hrane:\n\nDatum: 15. 1. 2026\nLokacija: Mercator Celje\nRazdeljevalec: Ana Novak\n\nHvala za tvojo pomoč!',
    footer: 'Lep pozdrav,\nKruh življenja',
    preview: 'Nova dodelitev za 15. 1. 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 8px' }
const footerStyle = { fontSize: '12px', color: '#71717a', lineHeight: '1.6', margin: '0 0 4px' }
