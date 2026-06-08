<?php
$file = 'app/Http/Controllers/CompanyPolicyController.php';
$content = file_get_contents($file);
$content = rtrim(trim($content), '}');
$newMethod = "
    /**
     * Download the specified policy document.
     */
    public function download(CompanyPolicy \$companyPolicy)
    {
        if (!\$companyPolicy->document_path || !\Illuminate\Support\Facades\Storage::disk('public')->exists(\$companyPolicy->document_path)) {
            abort(404, 'Document not found.');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download(\$companyPolicy->document_path);
    }
}
";
file_put_contents($file, $content . $newMethod);
echo "Successfully updated the controller.\n";
