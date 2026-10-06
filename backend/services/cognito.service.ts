import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  InitiateAuthCommand, 
  AdminUpdateUserAttributesCommand,
  AdminConfirmSignUpCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from '../config/env.js';

import crypto from 'node:crypto';

// Setup Cognito Client
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  }
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'dummy_client_id';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'dummy_pool_id';
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET || '';

function getSecretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) return undefined;
  return crypto.createHmac('sha256', CLIENT_SECRET).update(username + CLIENT_ID).digest('base64');
}

export const cognitoService = {
  async signUp(email: string, password: string, name: string, role: string) {
    // Generate a unique non-email username since the pool uses email aliases
    const username = crypto.randomUUID();
    
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      SecretHash: getSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:role', Value: role },
      ],
    });
    
    const response = await cognitoClient.send(command);

    // Auto-confirm the user so they don't have to verify their email to login
    if (USER_POOL_ID) {
      try {
        await cognitoClient.send(new AdminConfirmSignUpCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
        }));
      } catch (err: any) {
        console.warn('Auto-confirm failed:', err.message);
      }
    }

    return response.UserSub;
  },

  async signIn(email: string, password: string) {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(getSecretHash(email) ? { SECRET_HASH: getSecretHash(email)! } : {})
      },
    });

    const response = await cognitoClient.send(command);
    return response.AuthenticationResult;
  },
  
  async linkParentToStudent(parentEmail: string, studentEmail: string) {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: parentEmail,
      UserAttributes: [
        { Name: 'custom:linked_student', Value: studentEmail }
      ]
    });
    
    return await cognitoClient.send(command);
  },

  async getUser(accessToken: string) {
    const command = new GetUserCommand({
      AccessToken: accessToken
    });
    const response = await cognitoClient.send(command);
    const attrs: Record<string, string> = {};
    if (response.UserAttributes) {
      for (const attr of response.UserAttributes) {
        if (attr.Name && attr.Value) {
          attrs[attr.Name] = attr.Value;
        }
      }
    }
    return attrs;
  }
};
