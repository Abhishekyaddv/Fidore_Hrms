import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditPolicyModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    policy: any;
}

export function EditPolicyModal({ isOpen, setIsOpen, policy }: EditPolicyModalProps) {
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Compliance',
        status: 'Active',
        audience: 'All Employees',
        icon: 'file-text',
    });
    const [document, setDocument] = useState<File | null>(null);

    useEffect(() => {
        if (policy && isOpen) {
            setFormData({
                title: policy.title || '',
                description: policy.description || '',
                category: policy.category || 'Compliance',
                status: policy.status || 'Active',
                audience: policy.audience || 'All Employees',
                icon: policy.icon || 'file-text',
            });
            setDocument(null);
        }
    }, [policy, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setProcessing(true);
        const submitData = new FormData();
        submitData.append('_method', 'put');
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('status', formData.status);
        submitData.append('audience', formData.audience);
        submitData.append('icon', formData.icon);
        if (document) {
            submitData.append('document', document);
        }

        router.post(route('company-policies.update', policy.id), submitData, {
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (errors) => {
                console.error(errors);
            },
            onFinish: () => setProcessing(false)
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocument(e.target.files[0]);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-[#051C3F]">
                                        Edit Policy
                                    </Dialog.Title>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-[#051C3F] font-semibold">Policy Title *</Label>
                                        <Input 
                                            placeholder="e.g. Remote Work Guidelines" 
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            required
                                            className="bg-gray-50 border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[#051C3F] font-semibold">Description</Label>
                                        <textarea 
                                            placeholder="Brief overview of the policy..." 
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[#051C3F] font-semibold">Category</Label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.category}
                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            >
                                                <option value="Compliance">Compliance</option>
                                                <option value="Benefits">Benefits</option>
                                                <option value="Security">Security</option>
                                                <option value="General">General</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[#051C3F] font-semibold">Audience</Label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.audience}
                                                onChange={(e) => setFormData({...formData, audience: e.target.value})}
                                            >
                                                <option value="All Employees">All Employees</option>
                                                <option value="New Hires">New Hires</option>
                                                <option value="Managers">Managers</option>
                                                <option value="Contractors">Contractors</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[#051C3F] font-semibold">Status</Label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[#051C3F] font-semibold">Icon</Label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                            >
                                                <option value="file-text">Document (Default)</option>
                                                <option value="calendar-days">Calendar (Leaves/Time)</option>
                                                <option value="timer">Timer (Probation/Performance)</option>
                                                <option value="gavel">Gavel (Code of Conduct/Legal)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <Label className="text-[#051C3F] font-semibold">Update Document (Optional)</Label>
                                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 hover:bg-gray-50 transition-colors">
                                            <div className="text-center">
                                                {document ? (
                                                    <div className="flex flex-col items-center">
                                                        <FileText className="mx-auto h-10 w-10 text-[#0D4E78]" aria-hidden="true" />
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <span className="relative cursor-pointer rounded-md bg-white font-semibold text-[#0D4E78] focus-within:outline-none hover:underline">
                                                                {document.name}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setDocument(null)}
                                                            className="text-xs text-red-500 mt-2 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                                            <label
                                                                htmlFor="file-upload"
                                                                className="relative cursor-pointer rounded-md font-semibold text-[#0D4E78] focus-within:outline-none hover:underline"
                                                            >
                                                                <span>Upload a file</span>
                                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-500 mt-1">Leave empty to keep current file</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-600 border-gray-200"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-[#0D4E78] hover:bg-[#0A3D5E] text-white"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
