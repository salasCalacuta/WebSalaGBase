import React, { useState, useEffect } from 'react';
import { Room, RoomEquipment, RoomColor, GlobalConfig } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Camera, Save, Trash2, Link as LinkIcon, Users, Plus, Minus, Image as ImageIcon, Wallet } from 'lucide-react';

interface RoomsViewProps {
  rooms: Room[];
  onUpdateRoom: (room: Room) => void;
  onCreateRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
  onLoadDefaults: () => void;
  globalConfig: GlobalConfig;
  onUpdateConfig: (config: GlobalConfig) => void;
  activeSection?: 'salas' | 'encabezado' | 'administracion';
}

const ConfigSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}> = ({ title, icon, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
      <div className="text-[#D2B48C]">{icon}</div>
      <h4 className="text-lg font-bold text-white uppercase tracking-widest">{title}</h4>
    </div>
    {children}
  </div>
);

const RoomCard: React.FC<{ room: Room; onSave: (r: Room) => void; onDelete: (id: string) => void }> = ({ room, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Room>({
    ...room,
    images: room.images || (room.image ? [room.image] : []),
    equipment: room.equipment || {
      battery: '',
      guitarAmp1: '',
      guitarAmp2: '',
      bassAmp: '',
      console: '',
      piano: ''
    }
  });
  const [previewImages, setPreviewImages] = useState<string[]>(room.images || (room.image ? [room.image] : []));

  const handleEquipmentChange = (field: keyof RoomEquipment, value: string) => {
    setEditedRoom({
      ...editedRoom,
      equipment: {
        ...(editedRoom.equipment || {
          battery: '',
          guitarAmp1: '',
          guitarAmp2: '',
          bassAmp: '',
          console: '',
          piano: ''
        }),
        [field]: value
      }
    });
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [...(editedRoom.images || [])];
      let loaded = 0;
      
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          newImages.push(base64String);
          loaded++;
          
          if (loaded === files.length) {
            setPreviewImages(newImages);
            setEditedRoom({ ...editedRoom, images: newImages });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = (editedRoom.images || []).filter((_, i) => i !== index);
    setPreviewImages(newImages);
    setEditedRoom({ ...editedRoom, images: newImages });
  };

  const handleSave = () => {
    onSave(editedRoom);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Seguro que deseas eliminar la sala ${room.name}?`)) {
      onDelete(room.id);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-800 flex items-center justify-center overflow-hidden group">
        {previewImages.length > 0 ? (
          <div className="flex w-full h-full overflow-x-auto snap-x">
             {previewImages.map((img, idx) => (
               <div key={idx} className="min-w-full h-full relative snap-center">
                  <img 
                    src={img} 
                    alt={`${room.name} ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isEditing && (
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-500 z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
               </div>
             ))}
          </div>
        ) : (
          <div className="text-gray-600 flex flex-col items-center">
            <Camera size={48} strokeWidth={1} />
            <span className="text-xs mt-2 uppercase tracking-widest font-bold">Sin Fotos</span>
          </div>
        )}
        
        {isEditing && (
          <label className="absolute bottom-2 right-2 bg-black/60 p-2 rounded-full hover:bg-[#D2B48C] hover:text-black transition-all cursor-pointer z-20">
            <Camera size={20} />
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
          </label>
        )}

        {previewImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {previewImages.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {isEditing ? (
          <div className="space-y-3 flex-1">
            <Input 
              label="Nombre de la Sala" 
              value={editedRoom.name} 
              onChange={e => setEditedRoom({ ...editedRoom, name: e.target.value })}
            />
            <Input 
              type="number" 
              label="Precio por Hora" 
              value={editedRoom.price.toString()} 
              onChange={e => setEditedRoom({ ...editedRoom, price: Number(e.target.value) })}
            />
            
            <div className="space-y-2 border-t border-gray-800 pt-3 mt-3">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Equipamiento</p>
              <div className="grid grid-cols-1 gap-2">
                <Input 
                  label="Batería" 
                  value={editedRoom.equipment?.battery || ''} 
                  onChange={e => handleEquipmentChange('battery', e.target.value)}
                />
                <Input 
                  label="Ampli Guitarra 1" 
                  value={editedRoom.equipment?.guitarAmp1 || ''} 
                  onChange={e => handleEquipmentChange('guitarAmp1', e.target.value)}
                />
                <Input 
                  label="Ampli Guitarra 2" 
                  value={editedRoom.equipment?.guitarAmp2 || ''} 
                  onChange={e => handleEquipmentChange('guitarAmp2', e.target.value)}
                />
                <Input 
                  label="Ampli Bajo" 
                  value={editedRoom.equipment?.bassAmp || ''} 
                  onChange={e => handleEquipmentChange('bassAmp', e.target.value)}
                />
                <Input 
                  label="Consola" 
                  value={editedRoom.equipment?.console || ''} 
                  onChange={e => handleEquipmentChange('console', e.target.value)}
                />
                <Input 
                  label="Piano" 
                  value={editedRoom.equipment?.piano || ''} 
                  onChange={e => handleEquipmentChange('piano', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1 py-2">
                <Save size={16} className="mr-2" /> Guardar
              </Button>
              <Button variant="secondary" onClick={() => { setIsEditing(false); setEditedRoom(room); setPreviewImages(room.images || (room.image ? [room.image] : [])); }} className="flex-1 py-2">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xl font-bold text-[#D2B48C] uppercase tracking-wider">{room.name}</h4>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: room.hex }}></div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Precio: <span className="text-white font-bold">${room.price.toLocaleString()}</span> / hora
            </p>

            {room.equipment && (
              <div className="mb-4 space-y-1 text-[10px] text-gray-500 uppercase tracking-tighter border-t border-gray-800 pt-3">
                {room.equipment.battery && <div>Batería: {room.equipment.battery}</div>}
                {room.equipment.guitarAmp1 && <div>Ampli Gtr 1: {room.equipment.guitarAmp1}</div>}
                {room.equipment.guitarAmp2 && <div>Ampli Gtr 2: {room.equipment.guitarAmp2}</div>}
                {room.equipment.bassAmp && <div>Ampli Bajo: {room.equipment.bassAmp}</div>}
                {room.equipment.piano && <div>Piano: {room.equipment.piano}</div>}
                {room.equipment.console && <div>Consola: {room.equipment.console}</div>}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex-1 py-2 border-[#D2B48C]/30 text-[#D2B48C]">
                Editar
              </Button>
              <Button onClick={handleDelete} variant="danger" className="p-2">
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
               <p className="text-[10px] text-[#D2B48C] font-bold uppercase tracking-widest animate-pulse">
                 Aire Acondicionado y Servicio de Bar
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RoomsView: React.FC<RoomsViewProps> = ({ 
  rooms, 
  onUpdateRoom, 
  onCreateRoom, 
  onDeleteRoom, 
  onLoadDefaults,
  globalConfig,
  onUpdateConfig,
  activeSection = 'salas'
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newColor, setNewColor] = useState<RoomColor>(RoomColor.BLUE);

  const [localConfig, setLocalConfig] = useState<GlobalConfig>(globalConfig);

  useEffect(() => {
    setLocalConfig(globalConfig);
  }, [globalConfig]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const hexMap = {
      [RoomColor.BLUE]: '#3b82f6',
      [RoomColor.GREEN]: '#22c55e',
      [RoomColor.VIOLET]: '#8b5cf6',
      [RoomColor.RED]: '#ef4444'
    };

    const newRoom: Room = {
      id: `sala_${Date.now()}`,
      name: newName,
      price: Number(newPrice),
      color: newColor,
      hex: hexMap[newColor],
      equipment: {
        battery: '',
        guitarAmp1: '',
        guitarAmp2: '',
        bassAmp: '',
        console: '',
        piano: ''
      }
    };

    onCreateRoom(newRoom);
    setShowNewModal(false);
    setNewName('');
    setNewPrice('');
  };

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
  };

  const updateList = (key: keyof GlobalConfig, index: number, value: any) => {
    const newList = [...(localConfig[key] as any[])];
    newList[index] = value;
    setLocalConfig({ ...localConfig, [key]: newList });
  };

  const addItem = (key: keyof GlobalConfig, defaultValue: any) => {
    setLocalConfig({ ...localConfig, [key]: [...(localConfig[key] as any[]), defaultValue] });
  };

  const removeItem = (key: keyof GlobalConfig, index: number) => {
    const newList = (localConfig[key] as any[]).filter((_, i) => i !== index);
    setLocalConfig({ ...localConfig, [key]: newList });
  };

  return (
    <div className="space-y-12">
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-[#D2B48C] p-6 rounded w-full max-w-md">
            <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest">Nueva Sala</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Nombre de la Sala" value={newName} onChange={e => setNewName(e.target.value)} required />
              <Input type="number" label="Precio por Hora" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
              <Select label="Color Identificador" value={newColor} onChange={e => setNewColor(e.target.value as RoomColor)}>
                <option value={RoomColor.BLUE}>Azul</option>
                <option value={RoomColor.GREEN}>Verde</option>
                <option value={RoomColor.VIOLET}>Violeta</option>
                <option value={RoomColor.RED}>Rojo</option>
              </Select>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Crear Sala</Button>
                <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)} className="flex-1">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Config Sections */}
      {activeSection === 'encabezado' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#D2B48C] uppercase tracking-widest">Configuración del Encabezado</h3>
            <Button onClick={handleSaveConfig} className="bg-green-600 hover:bg-green-500">
              <Save size={16} className="mr-2" /> Guardar Cambios
            </Button>
          </div>
          <div className="max-w-2xl">
            <ConfigSection title="Links del Encabezado" icon={<LinkIcon size={20} />}>
              <div className="space-y-4">
                {['Instagram', 'Ubicacion', 'Youtube', 'X', 'Whatsapp'].map((label) => {
                  const link = localConfig.headerLinks.find(l => l.label === label) || { label, url: '', image: '' };
                  const idx = localConfig.headerLinks.findIndex(l => l.label === label);
                  
                  const getGenericImage = (l: string) => {
                    if (l === 'Instagram') return 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png';
                    if (l === 'Ubicacion') return 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg';
                    if (l === 'Youtube') return 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';
                    if (l === 'X') return 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png';
                    if (l === 'Whatsapp') return 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
                    return '';
                  };

                  const image = getGenericImage(label);

                  return (
                    <div key={label} className="p-3 border border-gray-800 rounded bg-black/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D2B48C] bg-black shrink-0">
                          <img src={image} alt={label} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-[#D2B48C] uppercase tracking-widest">{label}</span>
                          </div>
                          <Input 
                            placeholder={`URL de ${label}`}
                            value={link.url} 
                            onChange={e => {
                              if (idx >= 0) {
                                updateList('headerLinks', idx, { ...link, url: e.target.value, image });
                              } else {
                                const newList = [...localConfig.headerLinks, { label, url: e.target.value, image }];
                                setLocalConfig({ ...localConfig, headerLinks: newList });
                              }
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ConfigSection>
          </div>
        </div>
      )}

      {activeSection === 'administracion' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#D2B48C] uppercase tracking-widest">Administración Global</h3>
            <Button onClick={handleSaveConfig} className="bg-green-600 hover:bg-green-500">
              <Save size={16} className="mr-2" /> Guardar Cambios
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff Users */}
            <ConfigSection title="Personal de Staff" icon={<Users size={20} />}>
              <div className="space-y-4">
                {localConfig.staffUsers.map((user, idx) => (
                  <div key={idx} className="bg-black/20 p-4 rounded border border-white/5 space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input 
                          label="Nombre"
                          value={user.name} 
                          onChange={e => updateList('staffUsers', idx, { ...user, name: e.target.value })} 
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          label="Clave (Opcional)"
                          type="password"
                          value={user.password || ''} 
                          onChange={e => updateList('staffUsers', idx, { ...user, password: e.target.value })} 
                        />
                      </div>
                      <Button variant="danger" onClick={() => removeItem('staffUsers', idx)} className="p-2 h-[38px]">
                        <Minus size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] text-[#D2B48C] font-bold uppercase tracking-widest">Permisos de Acceso</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'].map(perm => (
                          <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={user.permissions?.includes(perm)}
                              onChange={e => {
                                const currentPerms = user.permissions || [];
                                const newPerms = e.target.checked 
                                  ? [...currentPerms, perm]
                                  : currentPerms.filter(p => p !== perm);
                                updateList('staffUsers', idx, { ...user, permissions: newPerms });
                              }}
                              className="w-3 h-3 rounded border-gray-700 bg-black text-[#D2B48C] focus:ring-[#D2B48C]"
                            />
                            <span className="text-[10px] text-gray-400 uppercase group-hover:text-white transition-colors">{perm.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addItem('staffUsers', { name: '', permissions: ['bandas', 'barra_banda', 'barra', 'vitrina', 'instrumentos', 'cierre'] })} className="w-full py-2">
                  <Plus size={16} className="mr-2" /> Agregar Personal
                </Button>
              </div>
            </ConfigSection>

            {/* Categorías */}
            <ConfigSection title="Categorías" icon={<Wallet size={20} />}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Income Categories */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#D2B48C] uppercase tracking-[0.2em] mb-4 border-b border-[#D2B48C]/20 pb-2">Ingresos</h4>
                  {localConfig.incomeCategories.map((cat, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input 
                          value={cat} 
                          onChange={e => updateList('incomeCategories', idx, e.target.value)} 
                        />
                      </div>
                      <Button variant="danger" onClick={() => removeItem('incomeCategories', idx)} className="p-2 h-[38px]">
                        <Minus size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addItem('incomeCategories', '')} className="w-full py-2">
                    <Plus size={16} className="mr-2" /> Agregar Categoría
                  </Button>
                </div>

                {/* Expense Categories */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#D2B48C] uppercase tracking-[0.2em] mb-4 border-b border-[#D2B48C]/20 pb-2">Egresos</h4>
                  {localConfig.expenseCategories.map((cat, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input 
                          value={cat} 
                          onChange={e => updateList('expenseCategories', idx, e.target.value)} 
                        />
                      </div>
                      <Button variant="danger" onClick={() => removeItem('expenseCategories', idx)} className="p-2 h-[38px]">
                        <Minus size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addItem('expenseCategories', '')} className="w-full py-2">
                    <Plus size={16} className="mr-2" /> Agregar Categoría
                  </Button>
                </div>
              </div>
            </ConfigSection>
          </div>
        </div>
      )}

      {/* Rooms Management Section */}
      {activeSection === 'salas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#D2B48C] uppercase tracking-widest">Gestión de Salas</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onLoadDefaults}>Cargar Predeterminados</Button>
              <Button onClick={() => setShowNewModal(true)}>+ Nueva Sala</Button>
            </div>
          </div>
          
          {rooms.length === 0 ? (
            <div className="bg-gray-900 border border-dashed border-gray-700 p-12 rounded-xl text-center">
              <p className="text-gray-500 mb-4">No hay salas configuradas en la base de datos.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setShowNewModal(true)}>Crear Primera Sala</Button>
                <Button variant="secondary" onClick={onLoadDefaults}>Cargar Salas Predeterminadas</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} onSave={onUpdateRoom} onDelete={onDeleteRoom} />
              ))}
            </div>
          )}
          
          <div className="mt-12 bg-gray-900/50 border border-dashed border-gray-700 p-6 rounded-xl text-center">
            <p className="text-gray-500 text-sm italic">
              Nota: Las fotos y el equipamiento se guardan en Supabase y se sincronizan en tiempo real.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
