import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link } from '@mui/material';
import { useAppSelector } from '../../hooks/storeHooks';

export function VendorsPage() {
  const vendors = useAppSelector((s) => s.vendors.items);
  const assets = useAppSelector((s) => s.assets.items);

  const countByVendor = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.vendorId] = (acc[a.vendorId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Vendors
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Hardware and software suppliers
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Website</TableCell>
                <TableCell align="right">Assets</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {vendor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{vendor.contactEmail}</TableCell>
                  <TableCell>
                    <Link href={vendor.website} target="_blank" rel="noopener">
                      {vendor.website.replace('https://', '')}
                    </Link>
                  </TableCell>
                  <TableCell align="right">{countByVendor[vendor.id] ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
