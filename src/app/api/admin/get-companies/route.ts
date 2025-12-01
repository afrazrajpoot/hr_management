// /app/api/users/hr-users/route.ts - With pagination and advanced filters
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET(request: NextRequest) {
    try {
        // Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Authorization - Only ADMIN can access
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true, email: true, firstName: true, lastName: true }
        });

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden. Admin access required.' },
                { status: 403 }
            );
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department');
        const hasCompany = searchParams.get('hasCompany');
        const companyId = searchParams.get('companyId');
        const isPaid = searchParams.get('paid');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            role: 'HR'
        };

        // Search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { hrId: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Department filter
        if (department) {
            where.department = {
                has: department
            };
        }

        // Company filter
        if (hasCompany === 'true') {
            where.hrId = { not: null };
        } else if (hasCompany === 'false') {
            where.hrId = null;
        }

        // Paid filter
        if (isPaid === 'true') {
            where.paid = true;
        } else if (isPaid === 'false') {
            where.paid = false;
        }

        // Get companies first if filtering by company
        let companyHrIds: string[] = [];
        if (companyId) {
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { hrId: true }
            });

            if (company && company.hrId.length > 0) {
                companyHrIds = company.hrId;
                where.hrId = { in: companyHrIds };
            } else {
                // If company has no HR IDs, return empty result
                return NextResponse.json({
                    success: true,
                    requestedBy: {
                        id: currentUser.id,
                        name: `${currentUser.firstName} ${currentUser.lastName}`,
                        email: currentUser.email,
                        role: currentUser.role
                    },
                    statistics: {
                        totalHrUsers: 0,
                        totalPages: 0,
                        currentPage: page
                    },
                    data: {
                        users: [],
                        companies: [],
                        groupedByCompany: {}
                    },
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                }, { status: 200 });
            }
        }

        // Fetch HR users with pagination
        const [hrUsers, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeId: true,
                            firstName: true,
                            lastName: true,
                            manager: true,
                            hireDate: true,
                            avatar: true
                        }
                    },
                    _count: {
                        select: {
                            jobs: true,
                            applications: true
                        }
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder
                },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        // Get all hrIds from the current page results
        const currentPageHrIds = hrUsers
            .map((user: any) => user.hrId)
            .filter((hrId: any): hrId is string => hrId !== null && hrId !== undefined);

        // Fetch companies for these HR users
        let companies: any = [];
        if (currentPageHrIds.length > 0) {
            companies = await prisma.company.findMany({
                where: {
                    hrId: {
                        hasSome: currentPageHrIds
                    }
                }
            });
        }

        // Create company map
        const companyMap = new Map<string, any>();
        companies.forEach((company: any) => {
            company.hrId.forEach((hrId: string) => {
                companyMap.set(hrId, company);
            });
        });

        // Combine user data with company info
        const usersWithCompany = hrUsers.map((user: any) => {
            const company = user.hrId ? companyMap.get(user.hrId) : null;

            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                paid: user.paid,
                amount: user.amount,
                quota: user.quota,
                department: user.department,
                hrId: user.hrId,
                position: user.position,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                image: user.image,
                employee: user.employee,
                jobCount: user._count.jobs,
                applicationCount: user._count.applications,
                company: company ? {
                    id: company.id,
                    name: company.companyDetail?.name || 'Unnamed Company',
                    companyDetail: company.companyDetail,
                    hrIds: company.hrId
                } : null
            };
        });

        // Get all companies for filter dropdown (optional)
        const allCompanies = await prisma.company.findMany({
            select: {
                id: true,
                companyDetail: true,
                hrId: true,
                _count: {
                    select: {
                        // We can't directly count users through company, but we can map later
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Enhance companies with user counts
        const companiesWithCounts = allCompanies.map((company: any) => {
            const hrUserCount = usersWithCompany.filter(
                (u: any) => u.hrId && company.hrId.includes(u.hrId)
            ).length;

            return {
                ...company,
                hrUserCount
            };
        });

        return NextResponse.json({
            success: true,
            requestedBy: {
                id: currentUser.id,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email,
                role: currentUser.role
            },
            filters: {
                search,
                department,
                hasCompany,
                companyId,
                isPaid,
                sortBy,
                sortOrder
            },
            statistics: {
                totalHrUsers: totalCount,
                currentPageCount: hrUsers.length,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                withCompany: hrUsers.filter((u: any) => u.hrId).length,
                withoutCompany: hrUsers.filter((u: any) => !u.hrId).length,
                paidUsers: hrUsers.filter((u: any) => u.paid).length,
                unpaidUsers: hrUsers.filter((u: any) => !u.paid).length
            },
            data: {
                users: usersWithCompany,
                companies: companiesWithCounts
            },
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin HR users API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}