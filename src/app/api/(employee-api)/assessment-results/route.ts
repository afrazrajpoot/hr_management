import { authOptions } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{
          const session:any | null = await getServerSession(authOptions);
                    console.log(session.user.id,'server session');
                   if (!session?.user?.id) {
                     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                   }
                   const assessmentResult = await prisma.individualEmployeeReport.findMany({
                    where: {
                      userId: session.user.id,
                    },
                  })
                   return NextResponse.json({
                       data:assessmentResult
                   })
    }catch(err){
        console.log(err);
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}