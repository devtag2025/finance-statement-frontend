"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import useDocumentStore from "@/stores/documentStore";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Check, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function UploadPage() {
  const user = useAuthStore((s) => s.user);

  const {
    file,
    setFile,
    uploadAndParse,
    calculate,
    exportResults,
    pages,
    fields,
    results,
    uploading,
    parsing,
    calculating,
    exporting,
    error,
    clear,
  } = useDocumentStore();

  const [newLabel, setNewLabel] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [showFields, setShowFields] = React.useState(true);
  const [showResults, setShowResults] = React.useState(true);

  const { addField, removeField, toggleFieldIncluded } = useDocumentStore();

  const isProcessing = uploading || parsing;
  const hasDocument = pages.length > 0;
  const hasFields = fields && fields.length > 0;
  const hasResults = results && Object.keys(results).length > 0;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background2.jpg)" }}
      />
      <div className="fixed inset-0 -z-15 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-primary/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-black/10 pointer-events-none" />

      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary drop-shadow-lg mb-2">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-brand-primary/90 text-lg drop-shadow-sm">
            Upload, process, and export your documents
          </p>
        </motion.div>

        {/* Main Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white/95 backdrop-blur border-brand-tint shadow-xl mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-brand-primary">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription className="text-brand-subtext">
                PDF, PNG, JPG (max 10MB)
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-brand-tint rounded-lg cursor-pointer hover:border-brand-primary hover:bg-brand-mint-light/30 transition-all duration-200"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-brand-primary/60 mb-3" />
                    <p className="text-sm text-brand-dark font-medium mb-1">
                      {file ? file.name : "Click to upload"}
                    </p>
                    <p className="text-xs text-brand-subtext">
                      Drag and drop or click to browse
                    </p>
                  </div>
                </label>
              </div>

              {/* Compact Status Summary */}
              <div className="flex flex-wrap gap-2">
                {hasDocument && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    <Check className="h-3 w-3" />
                    {pages.length} page{pages.length > 1 ? "s" : ""}
                  </span>
                )}
                {hasFields && (
                  <span className="inline-flex items-center gap-1 text-xs bg-brand-tint text-brand-primary px-3 py-1 rounded-full border border-brand-primary/20">
                    <Check className="h-3 w-3" />
                    {fields.length} fields
                  </span>
                )}
                {hasResults && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-brand-purple-light px-3 py-1 rounded-full border border-brand-purple-light/20">
                    <Check className="h-3 w-3" />
                    {Object.keys(results).length} results
                  </span>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  <X className="h-4 w-4 flex-shrink-0" />
                  <span>{error.join(", ")}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-3 bg-brand-tint/30 border-t border-brand-tint">
              <Button
                onClick={() => uploadAndParse(file)}
                disabled={!file || isProcessing}
                className="bg-brand-primary hover:bg-brand-purple-light text-brand-white shadow-sm"
              >
                {isProcessing ? "Processing..." : "Process"}
              </Button>

              <Button
                onClick={() => calculate("v1")}
                disabled={!hasFields || calculating}
                className="bg-brand-purple-light hover:bg-brand-primary text-brand-white shadow-sm"
              >
                {calculating ? "Calculating..." : "Calculate"}
              </Button>

              <Button
                onClick={() =>
                  exportResults({ format: "pdf", fileName: "report" })
                }
                disabled={!hasResults || exporting}
                className="bg-brand-purple-light hover:bg-brand-primary text-brand-white shadow-sm"
              >
                {exporting ? "Exporting..." : "Export PDF"}
              </Button>

              <Button
                variant="outline"
                onClick={clear}
                className="border-brand-primary text-brand-primary hover:bg-brand-tint ml-auto"
              >
                Clear
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Parsed Fields Section - Collapsible */}
        {hasFields && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white/95 backdrop-blur border-brand-tint shadow-xl mb-6">
              <CardHeader 
                className="cursor-pointer hover:bg-brand-tint/20 transition-colors"
                onClick={() => setShowFields(!showFields)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    <CardTitle className="text-xl text-brand-primary">
                      Extracted Fields
                    </CardTitle>
                    <span className="text-sm text-brand-subtext">
                      ({fields.length})
                    </span>
                  </div>
                  {showFields ? (
                    <ChevronUp className="h-5 w-5 text-brand-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-brand-primary" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {showFields && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Fields List */}
                      <div className="space-y-2">
                        {fields.map((f, idx) => (
                          <div
                            key={f.id || idx}
                            className="flex items-center justify-between gap-4 p-3 rounded-lg border border-brand-tint hover:bg-brand-mint-light/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={f.included}
                                onChange={() => toggleFieldIncluded(idx)}
                                className="w-4 h-4 text-brand-primary rounded border-brand-tint focus:ring-2 focus:ring-brand-primary cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`block text-sm ${
                                    f.included
                                      ? "text-brand-dark font-medium"
                                      : "text-brand-subtext line-through"
                                  }`}
                                >
                                  {f.label}
                                </span>
                                <span
                                  className={`block text-sm truncate ${
                                    f.included ? "text-brand-subtext" : "text-brand-subtext/60"
                                  }`}
                                >
                                  {f.value}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(idx)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Field */}
                      <div className="pt-4 border-t border-brand-tint">
                        <p className="text-sm font-medium text-brand-dark mb-3">Add Custom Field</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Label"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="flex-1 px-3 py-2 border border-brand-tint rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-brand-dark"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className="flex-1 px-3 py-2 border border-brand-tint rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-brand-dark"
                          />
                          <Button
                            onClick={() => {
                              if (!newLabel || !newValue) {
                                return toast.error("Both label and value are required");
                              }
                              addField({ label: newLabel, value: newValue });
                              setNewLabel("");
                              setNewValue("");
                              toast.success("Field added");
                            }}
                            className="bg-brand-primary hover:bg-brand-purple-light text-brand-white whitespace-nowrap"
                          >
                            <Plus className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Add</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Results Section - Collapsible */}
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white/95 backdrop-blur border-brand-tint shadow-xl">
              <CardHeader 
                className="cursor-pointer hover:bg-brand-tint/20 transition-colors"
                onClick={() => setShowResults(!showResults)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-brand-primary" />
                    <CardTitle className="text-xl text-brand-primary">
                      Results
                    </CardTitle>
                    <span className="text-sm text-brand-subtext">
                      ({Object.keys(results).length})
                    </span>
                  </div>
                  {showResults ? (
                    <ChevronUp className="h-5 w-5 text-brand-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-brand-primary" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {Object.entries(results).map(([key, value], idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 rounded-lg bg-brand-tint/40 border border-brand-tint"
                          >
                            <span className="text-sm font-medium text-brand-dark">{key}</span>
                            <span className="text-sm font-semibold text-brand-primary">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}