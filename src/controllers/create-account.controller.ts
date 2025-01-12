import { ConflictException, UsePipes } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";
import { z } from "zod";
import { create } from "domain";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string()
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body : CreateAccountBodySchema) {

    const { name, email, password } = createAccountBodySchema.parse(body)

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