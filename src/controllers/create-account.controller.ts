import { ConflictException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";


@Controller('accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body : any) {

    const { name, email, password } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email
      }
    })

    const hashPassword = await hash(password, 8)

    if (userWithSameEmail) {
      throw new ConflictException("Email already in use")
    }

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword
      }
    })
  }

}