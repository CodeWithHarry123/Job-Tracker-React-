import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";

type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

interface JobApplication {
  id: string;
  company: string;
  title: string;
  date: string;
  link: string;
  notes: string;
  status: JobStatus;
}

const STORAGE_KEY = "jobApplications";

const STATUS_STYLES: Record<JobStatus, { border: string; badgeBg: string; badgeText: string }> = {
  Applied: { border: "border-l-blue-500", badgeBg: "bg-blue-100", badgeText: "text-blue-800" },
  Interviewing: { border: "border-l-amber-500", badgeBg: "bg-amber-100", badgeText: "text-amber-800" },
  Offer: { border: "border-l-green-500", badgeBg: "bg-green-100", badgeText: "text-green-800" },
  Rejected: { border: "border-l-red-500", badgeBg: "bg-red-100", badgeText: "text-red-800" }
};

type FilterStatus = "All" | JobStatus;

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    date: "",
    link: "",
    notes: ""
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCompany, setDeleteCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as JobApplication[];
        if (Array.isArray(parsed)) {
          setJobs(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load jobs from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (error) {
      console.error("Failed to save jobs to localStorage", error);
    }
  }, [jobs, isLoaded]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const newJob: JobApplication = {
      id: Date.now().toString(),
      company: formData.company.trim(),
      title: formData.title.trim(),
      date: formData.date,
      link: formData.link.trim(),
      notes: formData.notes.trim(),
      status: "Applied"
    };

    setJobs(prev => [newJob, ...prev]);
    setFormData({
      company: "",
      title: "",
      date: "",
      link: "",
      notes: ""
    });
  };

  const handleStatusChange = (id: string, status: JobStatus) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === id
          ? {
              ...job,
              status
            }
          : job
      )
    );
  };

  const openDeleteConfirmation = (id: string) => {
    const job = jobs.find(j => j.id === id);
    setDeleteId(id);
    setDeleteCompany(job?.company || "");
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setJobs(prev => prev.filter(job => job.id !== deleteId));
    setDeleteId(null);
    setDeleteCompany("");
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteCompany("");
  };

  const formatDate = (value: string) => {
    if (!value) return "";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const filteredJobs =
    filterStatus === "All"
      ? jobs
      : jobs.filter(job => job.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">
            Keep track of your job applications, statuses, and notes in one place.
          </p>
        </header>

        <section className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add a new application
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date Applied
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                  Application Link
                </label>
                <input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Add any relevant details, interview stages, contacts, etc."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Application
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your applications</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-xs font-medium text-gray-700">
                Filter by status
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={event => setFilterStatus(event.target.value as FilterStatus)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
              Get started by adding your first application!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map(job => (
                <article
                  key={job.id}
                  className={`flex flex-col justify-between rounded-lg border-l-4 bg-white p-4 shadow-md ${STATUS_STYLES[job.status].border}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {job.company}
                        </h3>
                        <p className="mt-1 text-xs text-gray-700">{job.title}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status].badgeBg} ${STATUS_STYLES[job.status].badgeText}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <dl className="mt-3 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <dt className="font-medium">Date applied</dt>
                        <dd>{formatDate(job.date)}</dd>
                      </div>
                      {job.notes && (
                        <div>
                          <dt className="font-medium">Notes</dt>
                          <dd className="mt-0.5 whitespace-pre-wrap">
                            {job.notes}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md border border-blue-600 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                          View Job
                        </a>
                      )}
                      <div className="flex items-center gap-1">
                        <label
                          htmlFor={`status-${job.id}`}
                          className="text-xs text-gray-600"
                        >
                          Status
                        </label>
                        <select
                          id={`status-${job.id}`}
                          value={job.status}
                          onChange={event =>
                            handleStatusChange(job.id, event.target.value as JobStatus)
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offer">Offer</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openDeleteConfirmation(job.id)}
                      className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900">
              Delete application
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {deleteCompany || "this application"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
