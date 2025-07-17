export interface AuthenticatedRequest extends Request {
  user: {
    role: string;
    [key: string]: any;
  };
}
