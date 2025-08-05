export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  provider?: string;
}
