"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, ExternalLink, MapPin, Clock } from "lucide-react";

const agencies = [
  {
    name: "Thames Water",
    logo: "TW",
    description: "London and Thames Valley water services",
    phone: "0800 316 9800",
    emergency: "0800 714 614",
    email: "customer.services@thameswater.co.uk",
    website: "thameswater.co.uk",
    region: "England",
    color: "bg-blue-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "Anglian Water",
    logo: "AW",
    description: "East of England water services",
    phone: "03457 145 145",
    emergency: "03457 145 145",
    email: "customer.services@anglianwater.co.uk",
    website: "anglianwater.co.uk",
    region: "England",
    color: "bg-cyan-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Severn Trent",
    logo: "ST",
    description: "Midlands water and sewerage services",
    phone: "0345 750 0500",
    emergency: "0800 783 4444",
    email: "customer.relations@severntrent.co.uk",
    website: "stwater.co.uk",
    region: "England",
    color: "bg-purple-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "United Utilities",
    logo: "UU",
    description: "North West England water services",
    phone: "0345 672 3723",
    emergency: "0345 672 3723",
    email: "customer.services@uuplc.co.uk",
    website: "unitedutilities.com",
    region: "England",
    color: "bg-green-600",
    hours: "24/7 Emergency, 8AM-8PM General",
  },
  {
    name: "Yorkshire Water",
    logo: "YW",
    description: "Yorkshire and Humber water services",
    phone: "0345 124 2424",
    emergency: "0345 124 2424",
    email: "customer.services@yorkshirewater.co.uk",
    website: "yorkshirewater.com",
    region: "England",
    color: "bg-orange-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Scottish Water",
    logo: "SW",
    description: "Scotland's water and wastewater services",
    phone: "0800 0778 778",
    emergency: "0800 0778 778",
    email: "help@scottishwater.co.uk",
    website: "scottishwater.co.uk",
    region: "Scotland",
    color: "bg-blue-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Dŵr Cymru Welsh Water",
    logo: "WW",
    description: "Water services across Wales",
    phone: "0800 052 0145",
    emergency: "0800 052 0130",
    email: "customercare@dwrcymru.com",
    website: "dwrcymru.com",
    region: "Wales",
    color: "bg-teal-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Hafren Dyfrdwy",
    logo: "HD",
    description: "North-East Wales water services",
    phone: "0330 678 0679",
    emergency: "0800 085 8033",
    email: "customercare@hdcymru.co.uk",
    website: "hdcymru.co.uk",
    region: "Wales",
    color: "bg-teal-700",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Northern Ireland Water",
    logo: "NI",
    description: "Water and sewerage services in Northern Ireland",
    phone: "03457 440 088",
    emergency: "03457 440 088",
    email: "waterline@niwater.com",
    website: "niwater.com",
    region: "Northern Ireland",
    color: "bg-pink-600",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Uisce Éireann",
    logo: "IW",
    description: "National water utility for Ireland",
    phone: "1800 278 278",
    emergency: "1800 278 278",
    email: "business@water.ie",
    website: "water.ie",
    region: "Ireland",
    color: "bg-green-700",
    hours: "24/7 Emergency, 8AM-6PM General",
  },
  {
    name: "Environment Agency",
    logo: "EA",
    description: "Environmental regulator for England",
    phone: "03708 506 506",
    emergency: "0800 80 70 60",
    email: "enquiries@environment-agency.gov.uk",
    website: "gov.uk/environment-agency",
    region: "England",
    color: "bg-lime-700",
    hours: "24/7 Incident Line, office hours general",
  },
  {
    name: "Natural Resources Wales",
    logo: "NRW",
    description: "Environmental regulator for Wales",
    phone: "0300 065 3000",
    emergency: "0300 065 3000",
    email: "enquiries@naturalresourceswales.gov.uk",
    website: "naturalresources.wales",
    region: "Wales",
    color: "bg-green-800",
    hours: "Mon–Fri office hours, 24/7 incidents",
  },
  {
    name: "Scottish Environment Protection Agency",
    logo: "SEPA",
    description: "Environmental regulator for Scotland",
    phone: "0300 099 6699",
    emergency: "0800 807 060",
    email: "flooding@sepa.org.uk",
    website: "sepa.org.uk",
    region: "Scotland",
    color: "bg-indigo-700",
    hours: "24/7 Incident Line, office hours general",
  },
  {
    name: "Northern Ireland Environment Agency",
    logo: "NIEA",
    description: "Environmental regulator for Northern Ireland",
    phone: "0300 200 7856",
    emergency: "0800 80 70 60",
    email: "nieainfo@daera-ni.gov.uk",
    website: "daera-ni.gov.uk",
    region: "Northern Ireland",
    color: "bg-pink-700",
    hours: "24/7 Incident Line, office hours general",
  },
];

export function AgencyContacts() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [localCompany, setLocalCompany] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const regions = Array.from(new Set(agencies.map((a) => a.region)));
  const filteredAgencies =
    selectedRegion === "All"
      ? agencies
      : agencies.filter((a) => a.region === selectedRegion);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getCompanyFromPostcode = (postcode: string) => {
    const prefix = postcode.slice(0, 2).toUpperCase();
    const mapping: Record<string, string> = {
      SW: "Thames Water",
      NW: "Thames Water",
      SE: "Thames Water",
      EC: "Thames Water",
      WC: "Thames Water",
      CB: "Anglian Water",
      NR: "Anglian Water",
      B: "Severn Trent",
      CV: "Severn Trent",
      M: "United Utilities",
      WA: "United Utilities",
      LS: "Yorkshire Water",
    };
    return mapping[prefix] || "Unknown Water Company";
  };

  const getCompanyFromAddress = (address: any) => {
    const state = address?.state || "";
    if (state.includes("Scotland")) {
      return "Scottish Water";
    }
    if (state.includes("Wales")) {
      return "D\u0175r Cymru Welsh Water";
    }
    if (state.includes("Northern Ireland")) {
      return "Northern Ireland Water";
    }
    if (state.includes("Ireland")) {
      return "Uisce \u00c9ireann";
    }
    return getCompanyFromPostcode(address?.postcode || "");
  };

  const handleFindMyCompany = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
          const data = await res.json();
          setLocalCompany(getCompanyFromAddress(data.address));
          } catch (e) {
            console.error(e);
            setLocalCompany(null);
          }
          setLocating(false);
        },
        (error) => {
          console.error(error);
          setLocating(false);
        },
      );
    } else {
      setLocating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <CardTitle className="text-2xl font-bold">
          UK Water Agency Contacts
        </CardTitle>
        <p className="text-gray-300">
          Direct contact information for regional water authorities
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 flex justify-end">
          <Select
            value={selectedRegion}
            onValueChange={(v) => {
              setSelectedRegion(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAgencies.map((agency, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 ${agency.color} rounded-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-sm">
                        {agency.logo}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{agency.name}</h3>
                      <p className="text-sm text-gray-600">
                        {agency.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Region */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{agency.region}</span>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">General</span>
                    </div>
                    <a
                      href={`tel:${agency.phone}`}
                      className="text-sm font-mono text-blue-600 hover:underline"
                    >
                      {agency.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Emergency</span>
                    </div>
                    <a
                      href={`tel:${agency.emergency}`}
                      className="text-sm font-mono text-red-600 hover:underline"
                    >
                      {agency.emergency}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <a
                      href={`mailto:${agency.email}`}
                      className="text-sm text-green-600 hover:underline truncate"
                    >
                      Contact
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {agency.hours.split(",").map((part, idx) => (
                      <div key={idx}>{part.trim()}</div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <a href={`tel:${agency.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://${agency.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredAgencies.length)} of{" "}
            {filteredAgencies.length} agencies
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Finding Your Water Company
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Not sure which water company serves your area? Use your postcode
                to find your local water authority.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleFindMyCompany}
                disabled={locating}
              >
                {locating ? "Finding..." : "Find My Water Company"}
              </Button>
              {localCompany && (
                <p className="text-blue-800 text-sm mt-3">
                  Your local company: {localCompany}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
