"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  DollarSign,
  Stethoscope,
  Building2,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react"

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const appointments = [
    {
      id: "AP-001",
      patientName: "John Doe",
      patientPhone: "+91 9876543210",
      doctorName: "Dr. Sarah Johnson",
      pharmacyName: "Apollo Pharmacy",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 1500,
      symptoms: "Fever, headache",
      type: "consultation",
    },
    {
      id: "AP-002",
      patientName: "Jane Smith",
      patientPhone: "+91 9876543211",
      doctorName: "Dr. Rajesh Kumar",
      pharmacyName: "MedPlus Pharmacy",
      date: "2024-01-15",
      time: "11:30 AM",
      status: "pending",
      paymentStatus: "pending",
      amount: 2000,
      symptoms: "Chest pain, shortness of breath",
      type: "emergency",
    },
    {
      id: "AP-003",
      patientName: "Mike Johnson",
      patientPhone: "+91 9876543212",
      doctorName: "Dr. Priya Sharma",
      pharmacyName: "Wellness Pharmacy",
      date: "2024-01-15",
      time: "2:00 PM",
      status: "completed",
      paymentStatus: "paid",
      amount: 1200,
      symptoms: "Regular checkup",
      type: "followup",
    },
    {
      id: "AP-004",
      patientName: "Sarah Wilson",
      patientPhone: "+91 9876543213",
      doctorName: "Dr. Amit Patel",
      pharmacyName: "HealthCare Pharmacy",
      date: "2024-01-16",
      time: "9:00 AM",
      status: "cancelled",
      paymentStatus: "refunded",
      amount: 1800,
      symptoms: "Skin rash, itching",
      type: "consultation",
    },
  ]

  const stats = [
    {
      title: "Total Appointments",
      value: "1,247",
      change: "+12%",
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Today's Appointments",
      value: "34",
      change: "+5%",
      icon: Clock,
      color: "green",
    },
    {
      title: "Pending Payments",
      value: "₹45,600",
      change: "-8%",
      icon: DollarSign,
      color: "orange",
    },
    {
      title: "Completion Rate",
      value: "94.2%",
      change: "+2.1%",
      icon: CheckCircle,
      color: "purple",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "default",
      pending: "secondary",
      completed: "default",
      cancelled: "destructive",
    } as const

    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    } as const

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-gray-100 text-gray-800",
      failed: "bg-red-100 text-red-800",
    } as const

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointments</h2>
          <p className="text-slate-600 mt-2">Manage all patient appointments and medical consultations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>View and manage all patient appointments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appointment ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-slate-500">{appointment.patientPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-slate-400" />
                          <span>{appointment.doctorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span>{appointment.pharmacyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.date}</p>
                          <p className="text-sm text-slate-500">{appointment.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>{getPaymentBadge(appointment.paymentStatus)}</TableCell>
                      <TableCell className="font-medium">₹{appointment.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Calendar View</h3>
                    <p className="text-slate-500">Calendar integration would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Trends</CardTitle>
                    <CardDescription>Weekly appointment booking patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-500">Chart component would be rendered here</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Analytics</CardTitle>
                    <CardDescription>Revenue and payment status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <DollarSign className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-500">Payment analytics would be rendered here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
