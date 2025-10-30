#!/bin/bash

# Add PostgreSQL to PATH
export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"

echo "=========================================="
echo "PostgreSQL Database Setup"
echo "=========================================="
echo ""
echo "PostgreSQL 18 found at: /c/Program Files/PostgreSQL/18"
echo ""
echo "Please enter your PostgreSQL password when prompted"
echo "This is the password you set during PostgreSQL installation"
echo ""
echo "Creating database: insurance_claims"
echo ""

# Create database
psql -U postgres -c "CREATE DATABASE insurance_claims;" 2>&1 | grep -v "already exists" || echo "Database created successfully or already exists!"

# Verify database was created
echo ""
echo "Verifying database..."
psql -U postgres -c "\l" | grep insurance_claims && echo "✓ Database 'insurance_claims' confirmed!" || echo "✗ Database creation failed"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Now you can start your application:"
echo "  npm run dev"
echo ""
