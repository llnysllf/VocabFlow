window.VOCABFLOW_CONFIG = {
  // Set ENABLE_GOOGLE: true once the Google IdP is deployed in Cognito
  // (see backend/README.md "Google sign-in").
  ENABLE_GOOGLE: true,

  // AWS API Gateway endpoint (SAM stack output: ApiUrl).
  API_BASE_URL: "https://b82ayxojhh.execute-api.ap-southeast-2.amazonaws.com",

  // AWS Cognito (SAM stack outputs: Region, UserPoolId, UserPoolClientId, CognitoDomain).
  COGNITO_REGION: "ap-southeast-2",
  COGNITO_USER_POOL_ID: "ap-southeast-2_lWjRUeL9I",
  COGNITO_CLIENT_ID: "1b5724qkhfnri88a6vd30p3n2n",
  COGNITO_DOMAIN: "https://vocabflow-auth.auth.ap-southeast-2.amazoncognito.com"
};
