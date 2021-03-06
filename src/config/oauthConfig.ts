import { OAuthProvider } from '../oauth/oauthtoken.entity'

export interface IOAuthProviderConfig {
  baseApiUri: string
  authorizationUri: string
  clientId: string
  clientSecret: string
  accessTokenUri: string
  redirectUri: string
  onSuccessRedirectPath: string
  onFailedRedirectPath: string
  scope: string
  contentType: string
  percentEncodeRedirectUri: boolean
}

export interface IOAuthConfig {
  oauth: Record<OAuthProvider, IOAuthProviderConfig>
}

export default (): IOAuthConfig => ({
  oauth: {
    [OAuthProvider.ASANA]: {
      baseApiUri: 'https://app.asana.com/-/',
      authorizationUri: 'https://app.asana.com/-/oauth_authorize',
      clientId: process.env.ASANA_CLIENT_ID || '',
      clientSecret: process.env.ASANA_CLIENT_SECRET || '',
      accessTokenUri: 'https://app.asana.com/-/oauth_token',
      redirectUri: 'https://gusto.apps.bitmatica.com/auth/asana/callback',
      onSuccessRedirectPath: '/asana/success',
      onFailedRedirectPath: '/asana/failed',
      scope: '',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
    [OAuthProvider.GOOGLE]: {
      baseApiUri: 'https://www.googleapis.com/',
      authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      accessTokenUri: 'https://oauth2.googleapis.com/token',
      redirectUri: 'https://gusto.apps.bitmatica.com/auth/google/callback',
      onSuccessRedirectPath: '/google/success',
      onFailedRedirectPath: '/google/failed',
      scope:
        process.env.GOOGLE_SCOPE ||
        'https://www.googleapis.com/auth/admin.reports.usage.readonly https://www.googleapis.com/auth/gmail.readonly"',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
    [OAuthProvider.GUSTO]: {
      baseApiUri: 'https://api.gusto-demo.com/',
      authorizationUri: 'https://api.gusto-demo.com/oauth/authorize',
      clientId: process.env.GUSTO_CLIENT_ID || '',
      clientSecret: process.env.GUSTO_CLIENT_SECRET || '',
      accessTokenUri: 'https://api.gusto-demo.com/oauth/token',
      redirectUri: 'https://gusto.apps.bitmatica.com/authCallback',
      onSuccessRedirectPath: '/gusto/success',
      onFailedRedirectPath: '/gusto/failed',
      scope: '',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
    [OAuthProvider.HUBSPOT]: {
      baseApiUri: 'https://app.hubspot.com/',
      authorizationUri: 'https://app.hubspot.com/oauth/authorize',
      clientId: process.env.HUBSPOT_CLIENT_ID || '',
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
      accessTokenUri: 'https://api.hubapi.com/oauth/v1/token',
      redirectUri: 'https://gusto.apps.bitmatica.com/auth/hubspot/callback',
      onSuccessRedirectPath: '/hubspot/success',
      onFailedRedirectPath: '/hubspot/failed',
      scope: 'oauth',
      contentType: 'application/x-www-form-urlencoded;charset=utf-8',
      percentEncodeRedirectUri: false,
    },
    [OAuthProvider.SLACK]: {
      baseApiUri: 'https://slack.com/',
      authorizationUri: 'https://slack.com/oauth/authorize',
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      accessTokenUri: 'https://slack.com/api/oauth.access',
      redirectUri: 'https://gusto.apps.bitmatica.com/auth/slack/callback',
      onSuccessRedirectPath: '/slack/success',
      onFailedRedirectPath: '/slack/failed',
      scope: '',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
    [OAuthProvider.ZOOM]: {
      baseApiUri: 'https://zoom.us/',
      authorizationUri: 'https://zoom.us/oauth/authorize',
      clientId: process.env.ZOOM_CLIENT_ID || '',
      clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
      accessTokenUri: 'https://zoom.us/oauth/token',
      redirectUri: 'https://gusto.apps.bitmatica.com/auth/zoom/callback',
      onSuccessRedirectPath: '/zoom/success',
      onFailedRedirectPath: '/zoom/failed',
      scope: '',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
  },
})
