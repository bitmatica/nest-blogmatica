export default () => ({
  oauth: {
    gusto: {
      baseApiUri: 'https://api.gusto-demo.com/',
      authorizationUri: 'https://api.gusto-demo.com/oauth/authorize',
      clientId: process.env.GUSTO_CLIENT_ID,
      clientSecret: process.env.GUSTO_CLIENT_SECRET,
      accessTokenUri: 'https://api.gusto-demo.com/oauth/token',
      redirectUri: 'https://gusto.apps.bitmatica.com/authCallback',
      onSuccessRedirectPath: '/gusto/success',
      onFailedRedirectPath: '/gusto/failed',
      scope: '',
      contentType: 'application/json',
      percentEncodeRedirectUri: true,
    },
  },
})
