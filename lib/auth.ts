import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("No credentials provided");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        if (!user) {
          throw new Error("User not found with provided credentials");
        }

        const isPasswordValid = await compare(
          credentials?.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        throw new Error("No email found");
      }

      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: {
              email: user.email,
            },
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                avatar: user.image,
                name: user.name || user.email.split("@")[0],
                password: "",
              },
            });
          }

          return true;
        } catch (error) {
          console.log("Error signing in with Google", error);
          return false;
        }
      }

      return true;
    },

    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email as string,
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.avatar = dbUser.avatar ?? undefined;
        }
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
