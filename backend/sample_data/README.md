# Sample Data

This directory contains (or links to) publicly available legal contract datasets
used for demonstration and testing with LegalLens AI.

## Datasets

### 1. CUAD (Contract Understanding Atticus Dataset)

- **Source:** https://github.com/TheAtticusProject/cuad
- **License:** CC BY 4.0 (redistribution permitted with attribution)
- **Description:** 510 commercial contracts annotated with 41 clause types.
- **Download:** Run `python -m scripts.download_datasets` or download manually
  from the GitHub repository above.

### 2. SEC EDGAR Sample Contracts

- **Source:** https://www.sec.gov/edgar/search/
- **License:** Public domain (U.S. government work)
- **Description:** Contracts filed as exhibits (e.g., Exhibit 10) with the SEC.
- **Download:** Run `python -m scripts.download_datasets` or search EDGAR directly.

### 3. Kaggle Legal Contract Datasets

- **Source:** https://www.kaggle.com/datasets?search=legal+contract
- **License:** Varies — many datasets restrict redistribution.
- **Note:** Kaggle datasets are **not** downloaded automatically because:
  1. Kaggle requires authentication (API token).
  2. Many datasets prohibit redistribution.
- **Manual download:**
  1. Create a free Kaggle account.
  2. Visit a dataset page (e.g., "Legal Contract Review Dataset").
  3. Download and extract into `backend/sample_data/kaggle/`.
  4. Respect the dataset's license terms.

## Synthetic Sample Contracts

The `sample_contracts/` subdirectory contains 10 AI-generated synthetic
contracts for demonstration purposes. These are clearly labeled as synthetic
and are not real legal documents. They include:

1. Employment Agreement
2. Non-Disclosure Agreement (NDA)
3. Software Development Agreement
4. SaaS Agreement
5. Consulting Agreement
6. Service Agreement
7. Vendor Agreement
8. Lease Agreement
9. Partnership Agreement
10. Freelancer Agreement

## Running the Downloader

```bash
cd backend
python -m scripts.download_datasets
```

The script:
- Downloads datasets from official public sources where permitted.
- Verifies successful download by checking file size.
- Organizes files into subdirectories.
- Skips datasets that already exist.
- Prints progress messages.
