import { IsEmail, IsNotEmpty } from 'class-validator';

export class signUpDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  name: string;
  role: 'USER' | 'ADMIN' = 'USER';
}
