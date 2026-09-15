// src/pages/products/ProductListPage.tsx
// Exact 1:1 SCR-WEB-03 (Daftar Produk) from SAH Web Admin (standalone).html

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteProduct, fetchProducts } from '../../store/productSlice';
import { useSahToast } from '../../context/ToastContext';
import { CH, type StatusChipDef } from '../../constants/sahNav';
import type { Product } from '../../types/apiDef';
import { checkIsReadOnly } from '../../store/authSlice';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast, stateDemo, setStateDemo, lang } = useSahToast();

  const { items: products, loading: isLoading, error } = useAppSelector((s) => s.products);
  const userInfo = useAppSelector((s) => s.auth.userInfo);
  const isReadOnly = checkIsReadOnly(userInfo);

  const [searchQuery, setSearchQuery] = useState('');
  const [halalFilter, setHalalFilter] = useState<'all' | 'halal' | 'pending' | 'non_halal' | 'not_halal'>('all');
  const [indexFilter, setIndexFilter] = useState<'all' | 'indexed' | 'pending' | 'failed'>('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [currentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ reset: true }));
  }, [dispatch]);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        p.sku_code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q));

      const matchHalal = halalFilter === 'all' || p.halal_status === halalFilter;
      const matchIndex = indexFilter === 'all' || p.index_status === indexFilter;
      const matchManufacturer =
        manufacturerFilter === 'all' ||
        (p.manufacturer || '').toLowerCase() === manufacturerFilter.toLowerCase();

      return matchQuery && matchHalal && matchIndex && matchManufacturer;
    });
  }, [products, searchQuery, halalFilter, indexFilter, manufacturerFilter]);

  // Unique manufacturer list for dropdown
  const manufacturerOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.manufacturer) set.add(p.manufacturer); });
    return Array.from(set).sort();
  }, [products]);

  // Status Chip helper
  const renderStatusChip = (type: 'halal' | 'index', status: string) => {
    let chipDef: StatusChipDef = CH.draft;
    let label = status;

    if (type === 'halal') {
      if (status === 'halal') {
        chipDef = CH.verified;
        label = lang === 'id' ? 'Halal terverifikasi' : 'Halal verified';
      } else if (status === 'pending') {
        chipDef = CH.wait;
        label = lang === 'id' ? 'Sertifikat diperbarui' : 'Certificate renewed';
      } else {
        chipDef = CH.bad;
        label = lang === 'id' ? 'Tidak bersertifikat' : 'Not certified';
      }
    } else {
      if (status === 'indexed') {
        chipDef = CH.ok;
        label = lang === 'id' ? 'Terindeks' : 'Indexed';
      } else if (status === 'pending') {
        chipDef = CH.wait;
        label = lang === 'id' ? 'Menunggu indeks' : 'Pending index';
      } else {
        chipDef = CH.bad;
        label = lang === 'id' ? 'Galat ekstraksi' : 'Extraction error';
      }
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 11px',
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          background: chipDef.bg,
          border: `1px solid ${chipDef.bd}`,
          color: 'var(--sah-frame)',
        }}
      >
        <span style={{ fontSize: 9, color: chipDef.gc }}>{chipDef.g}</span>
        {label}
      </span>
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(deleteTarget.id)).unwrap();
      showToast(
        lang === 'id'
          ? `SKU ${deleteTarget.sku_code} berhasil dihapus. Vektor fitur dicabut (FR-CAT-05, -10).`
          : `SKU ${deleteTarget.sku_code} successfully deleted. Feature vectors revoked (FR-CAT-05, -10).`
      );
      setDeleteTarget(null);
    } catch {
      showToast(lang === 'id' ? 'Gagal menghapus SKU.' : 'Failed to delete SKU.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine view state
  const isStateLoading = stateDemo === 'memuat' || (stateDemo === 'data' && isLoading);
  const isStateEmpty = stateDemo === 'kosong' || (stateDemo === 'data' && !isLoading && filteredProducts.length === 0);
  const isStateError = stateDemo === 'galat' || (stateDemo === 'data' && !isLoading && !!error);
  const isStateData = stateDemo === 'data' && !isStateLoading && !isStateEmpty && !isStateError;

  return (
    <div
      style={{
        background: 'var(--sah-white)',
        border: '1px solid var(--sah-line)',
        borderRadius: 24,
        boxShadow: 'var(--sah-shadow)',
        overflow: 'hidden',
      }}
    >
      {/* Table Toolbar */}
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--sah-line)',
        }}
      >
        {/* Search input */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 13px',
            border: '1px solid var(--sah-line)',
            borderRadius: 13,
            background: 'var(--sah-ivory)',
            flex: 1,
            minWidth: 190,
            maxWidth: 300,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--sah-muted)"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16M21 21l-4.3-4.3" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU, nama produk, produsen…"
            style={{
              border: 0,
              background: 'none',
              outline: 'none',
              width: '100%',
              fontSize: 12.5,
              color: 'var(--sah-navy)',
            }}
          />
        </label>

        {/* Filter dropdowns */}
        {/* Halal Status Filter */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            value={halalFilter}
            onChange={(e) => setHalalFilter(e.target.value as typeof halalFilter)}
            style={{
              height: 36,
              padding: '0 32px 0 13px',
              border: `1px solid ${halalFilter !== 'all' ? 'var(--sah-copper)' : 'var(--sah-line)'}`,
              borderRadius: 13,
              background: halalFilter !== 'all' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--sah-navy)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="all">Status Halal</option>
            <option value="halal">Halal</option>
            <option value="pending">Menunggu</option>
            <option value="not_halal">Tidak Halal</option>
          </select>
          <span style={{ position: 'absolute', right: 10, pointerEvents: 'none', fontSize: 9, color: 'var(--sah-muted)' }}>▾</span>
        </div>

        {/* Index Status Filter */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            value={indexFilter}
            onChange={(e) => setIndexFilter(e.target.value as typeof indexFilter)}
            style={{
              height: 36,
              padding: '0 32px 0 13px',
              border: `1px solid ${indexFilter !== 'all' ? 'var(--sah-copper)' : 'var(--sah-line)'}`,
              borderRadius: 13,
              background: indexFilter !== 'all' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--sah-navy)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="all">Status Indeks</option>
            <option value="indexed">Terindeks</option>
            <option value="pending">Menunggu</option>
            <option value="failed">Gagal</option>
          </select>
          <span style={{ position: 'absolute', right: 10, pointerEvents: 'none', fontSize: 9, color: 'var(--sah-muted)' }}>▾</span>
        </div>

        {/* Manufacturer Filter */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            value={manufacturerFilter}
            onChange={(e) => setManufacturerFilter(e.target.value)}
            style={{
              height: 36,
              padding: '0 32px 0 13px',
              border: `1px solid ${manufacturerFilter !== 'all' ? 'var(--sah-copper)' : 'var(--sah-line)'}`,
              borderRadius: 13,
              background: manufacturerFilter !== 'all' ? 'var(--sah-copper-pale)' : 'var(--sah-white)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--sah-navy)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              maxWidth: 180,
            }}
          >
            <option value="all">Semua Produsen</option>
            {manufacturerOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 10, pointerEvents: 'none', fontSize: 9, color: 'var(--sah-muted)' }}>▾</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action button + Tambah SKU */}
        {!isReadOnly && (
          <button
            onClick={() => navigate('/produk/form')}
            style={{
              height: 36,
              padding: '0 15px',
              border: '1px solid var(--sah-copper)',
              borderRadius: 13,
              background: 'var(--sah-copper)',
              color: 'var(--sah-white)',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sah-copper-pressed)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--sah-copper)')}
          >
            + Tambah SKU
          </button>
        )}
      </div>

      {/* ── STATE: DATA TABLE ───────────────────────────────── */}
      {isStateData && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 760, fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'left',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      width: 150,
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  >
                    Kode SKU
                  </th>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'left',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  >
                    Produk
                  </th>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'left',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      width: 200,
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  >
                    Produsen
                  </th>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'left',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      width: 170,
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  >
                    Status halal
                  </th>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'left',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      width: 160,
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  >
                    Status indeks
                  </th>
                  <th
                    style={{
                      background: 'var(--sah-mist-soft)',
                      textAlign: 'right',
                      padding: '11px 16px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: 'var(--sah-blue-strong)',
                      whiteSpace: 'nowrap',
                      width: 180,
                      borderBottom: '1px solid var(--sah-line)',
                    }}
                  />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p: Product, idx: number) => (
                  <tr
                    key={p.id}
                    style={{
                      height: 54,
                      background: idx % 2 === 1 ? 'rgba(23,36,58,.018)' : 'transparent',
                      transition: 'background .12s ease',
                    }}
                  >
                    {/* Kode SKU */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        verticalAlign: 'middle',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 13.5,
                          color: 'var(--sah-navy)',
                        }}
                      >
                        {p.sku_code}
                      </div>
                    </td>

                    {/* Produk */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        verticalAlign: 'middle',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--sah-navy)' }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--sah-muted)', marginTop: 1 }}>
                        Terdaftar{' '}
                        {new Date(p.created_at || '2026-01-12T00:00:00Z').toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Produsen */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        verticalAlign: 'middle',
                        color: 'var(--sah-navy)',
                      }}
                    >
                      {p.manufacturer}
                    </td>

                    {/* Status halal */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {renderStatusChip('halal', p.halal_status)}
                    </td>

                    {/* Status indeks */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {renderStatusChip('index', p.index_status)}
                    </td>

                    {/* Aksi */}
                    <td
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--sah-line)',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      <button
                        onClick={() => navigate(`/produk/detail/${p.id}`)}
                        style={{
                          height: 31,
                          padding: '0 12px',
                          marginLeft: 6,
                          border: '1px solid var(--sah-line)',
                          borderRadius: 11,
                          background: 'var(--sah-white)',
                          color: 'var(--sah-navy)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sah-copper)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
                      >
                        Detail
                      </button>

                      <button
                        onClick={() => navigate(`/produk/form/${p.id}`)}
                        style={{
                          height: 31,
                          padding: '0 12px',
                          marginLeft: 6,
                          border: '1px solid var(--sah-line)',
                          borderRadius: 11,
                          background: 'var(--sah-white)',
                          color: 'var(--sah-navy)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sah-copper)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
                      >
                        Sunting
                      </button>

                      {!isReadOnly && (
                        <button
                          onClick={() => setDeleteTarget(p)}
                          style={{
                            height: 31,
                            padding: '0 10px',
                            marginLeft: 6,
                            border: '1px solid var(--sah-line)',
                            borderRadius: 11,
                            background: 'rgba(168,95,79,.08)',
                            color: 'var(--danger)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--danger)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sah-line)')}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              borderTop: '1px solid var(--sah-line)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--sah-muted)', flex: 1 }}>
              {lang === 'id'
                ? `Menampilkan 1–${filteredProducts.length} dari ${products.length} baris`
                : `Showing 1–${filteredProducts.length} of ${products.length} rows`}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={currentPage === 1}
                style={{
                  minWidth: 33,
                  height: 33,
                  padding: '0 9px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 11,
                  background: 'var(--sah-white)',
                  color: 'var(--sah-muted)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>
              <button
                style={{
                  minWidth: 33,
                  height: 33,
                  padding: '0 9px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 11,
                  background: 'var(--sah-navy)',
                  color: 'var(--sah-white)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                1
              </button>
              <button
                style={{
                  minWidth: 33,
                  height: 33,
                  padding: '0 9px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 11,
                  background: 'var(--sah-white)',
                  color: 'var(--sah-navy)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                2
              </button>
              <button
                style={{
                  minWidth: 33,
                  height: 33,
                  padding: '0 9px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 11,
                  background: 'var(--sah-white)',
                  color: 'var(--sah-navy)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                3
              </button>
              <button
                style={{
                  minWidth: 33,
                  height: 33,
                  padding: '0 9px',
                  border: '1px solid var(--sah-line)',
                  borderRadius: 11,
                  background: 'var(--sah-white)',
                  color: 'var(--sah-navy)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STATE: LOADING SKELETON ─────────────────────────── */}
      {isStateLoading && (
        <div style={{ padding: 18 }}>
          {[
            { w: '100%' },
            { w: '92%' },
            { w: '96%' },
            { w: '88%' },
            { w: '94%' },
            { w: '80%' },
            { w: '90%' },
          ].map((s, idx) => (
            <div
              key={idx}
              style={{
                height: 38,
                borderRadius: 12,
                marginBottom: 9,
                background:
                  'linear-gradient(90deg, rgba(23,36,58,.04) 0%, rgba(23,36,58,.09) 40%, rgba(23,36,58,.04) 80%)',
                backgroundSize: '360px 100%',
                animation: 'shim 1.25s linear infinite',
                width: s.w,
              }}
            />
          ))}
          <div style={{ fontSize: 12, color: 'var(--sah-muted)', marginTop: 4 }}>
            {lang === 'id' ? 'Memuat data…' : 'Loading data…'}
          </div>
        </div>
      )}

      {/* ── STATE: EMPTY ────────────────────────────────────── */}
      {isStateEmpty && (
        <div
          style={{
            padding: '64px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              background: 'var(--sah-mist-soft)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--sah-blue-strong)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h9" />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: 'var(--sah-navy)',
            }}
          >
            {lang === 'id' ? 'Belum ada data' : 'No data yet'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--sah-muted)', maxWidth: 400 }}>
            Katalog masih kosong. Daftarkan SKU pertama melalui Form SKU (FR-CAT-02).
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setHalalFilter('all');
              setIndexFilter('all');
              setStateDemo('data');
            }}
            style={{
              marginTop: 6,
              height: 38,
              padding: '0 16px',
              borderRadius: 13,
              border: '1px solid var(--sah-line)',
              background: 'var(--sah-white)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* ── STATE: ERROR ────────────────────────────────────── */}
      {isStateError && (
        <div
          style={{
            padding: '56px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              background: 'rgba(168,95,79,.12)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 8v5M12 16.5v.5M10.3 3.9 2.5 18a1.7 1.7 0 0 0 1.5 2.5h16a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a1.7 1.7 0 0 0-3 0" />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: 'var(--sah-navy)',
            }}
          >
            {lang === 'id' ? 'Gagal memuat data' : 'Failed to load data'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--sah-muted)', maxWidth: 420 }}>
            Permintaan ke layanan tidak berhasil. Coba lagi atau hubungi administrator sistem.
          </div>
          <button
            onClick={() => setStateDemo('data')}
            style={{
              marginTop: 6,
              height: 40,
              padding: '0 18px',
              border: 0,
              borderRadius: 14,
              background: 'var(--sah-copper)',
              color: 'var(--sah-white)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(23,36,58,.45)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--sah-white)',
              borderRadius: 24,
              border: '1px solid var(--sah-line)',
              boxShadow: 'var(--sah-shadow)',
              padding: '28px 28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'rise .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(168,95,79,.12)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--danger)',
                  flex: 'none',
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: 'var(--sah-navy)',
                  }}
                >
                  Hapus SKU Produk?
                </div>
                <div style={{ fontSize: 12, color: 'var(--sah-muted)' }}>
                  Penghapusan memerlukan konfirmasi (FR-CAT-05).
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--sah-ivory)',
                border: '1px solid var(--sah-line)',
                borderRadius: 14,
                padding: '12px 14px',
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--sah-navy)' }}>{deleteTarget.name}</div>
              <div style={{ color: 'var(--sah-muted)', fontSize: 12, marginTop: 2 }}>
                Kode SKU: {deleteTarget.sku_code} · {deleteTarget.manufacturer}
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--sah-frame)', lineHeight: 1.5 }}>
              Penghapusan SKU akan mencabut seluruh vektor fitur visual dan menghapus foto referensi terkait dari indeks pencarian (FR-CAT-05, -10).
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: '1px solid var(--sah-line)',
                  background: 'var(--sah-white)',
                  color: 'var(--sah-navy)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  border: 0,
                  background: 'var(--danger)',
                  color: 'var(--sah-white)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {isDeleting ? 'Menghapus…' : 'Ya, Hapus SKU'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
