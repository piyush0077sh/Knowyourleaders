"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Sparkles } from "lucide-react"

export function ShadcnDemo() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                shadcn/ui Showcase
              </CardTitle>
              <CardDescription>
                Installed and configured with Next.js, TypeScript, and Tailwind CSS v4.
              </CardDescription>
            </div>
            <Badge variant="default" className="text-xs px-3 py-1">
              7 Components Installed
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tabs Showcase */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview & Controls</TabsTrigger>
              <TabsTrigger value="data">Leader Records Table</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Button & Badge Gallery */}
                <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Button & Badge Variants
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="destructive" size="sm">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="default">Active Leader</Badge>
                    <Badge variant="secondary">MP - Lok Sabha</Badge>
                    <Badge variant="outline">Verified Record</Badge>
                    <Badge variant="destructive">Pending Audit</Badge>
                  </div>
                </div>

                {/* Select & Dropdown Menu Showcase */}
                <div className="p-4 border rounded-lg space-y-3 bg-muted/20">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Select & Dropdown Menu
                  </h4>
                  <div className="space-y-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="north">North India</SelectItem>
                        <SelectItem value="south">South India</SelectItem>
                        <SelectItem value="east">East India</SelectItem>
                        <SelectItem value="west">West India</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">Quick Actions</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Options <MoreHorizontal className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Export PDF Report</DropdownMenuItem>
                          <DropdownMenuItem>Share Constituency</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Archive Record</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leader Name</TableHead>
                      <TableHead>Constituency</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Narendra Modi</TableCell>
                      <TableCell>Varanasi</TableCell>
                      <TableCell><Badge variant="secondary">BJP</Badge></TableCell>
                      <TableCell><Badge variant="default">Verified</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Rahul Gandhi</TableCell>
                      <TableCell>Rae Bareli</TableCell>
                      <TableCell><Badge variant="secondary">INC</Badge></TableCell>
                      <TableCell><Badge variant="default">Verified</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Akhilesh Yadav</TableCell>
                      <TableCell>Kannauj</TableCell>
                      <TableCell><Badge variant="secondary">SP</Badge></TableCell>
                      <TableCell><Badge variant="outline">Updated</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
          Configured with tailwind-merge, clsx, class-variance-authority, and Radix UI primitives.
        </CardFooter>
      </Card>
    </div>
  )
}
