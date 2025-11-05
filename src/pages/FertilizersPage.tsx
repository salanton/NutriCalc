import React from 'react'
import { Droplet, SprayCan, Circle, CheckCheck, CircleDot, Check, TestTube2, PlusSquare, CheckSquare } from "lucide-react"
import { SectionCard } from "@/components/section-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { dataService } from '@/lib/dataService'
import { useCalculatorWithSettings } from '@/hooks/useCalculatorWithSettings'
import type { Additive, GrowMethod, Nutrient } from '@/lib/types'
import { BottomNavigation } from "@/components/bottom-navigation"

export default function FertilizersPage() {
  const brands = dataService.getVisibleBrands();

  const {
    growMethod,
    growthStage,
    selectedAdditives,
    setSelectedAdditives,
    nutrientBrand,
    setNutrientBrand,
    hideDescriptions,
    isProMode,
    isRussian,
    selectedAdditiveBrands,
    setSelectedAdditiveBrands,
    toggleAdditive,
    isAdditiveSelected,
    isBaseNutrientSelected,
    setSelectedBaseNutrients,
    selectedBaseNutrients,
    toggleNutrientBrand,
    isNutrientBrandSelected,
    selectedNutrientBrands,
    showAverageValues,
  } = useCalculatorWithSettings()


  // Auto-select brands that have selected additives
  React.useEffect(() => {
    const brandsWithAdditives = selectedAdditives.reduce((acc, additive) => {
      if (!acc.includes(additive.brand)) {
        acc.push(additive.brand);
      }
      return acc;
    }, [] as string[]);

    // Only add brands that are not already in selectedAdditiveBrands
    const newBrandsToSelect = brandsWithAdditives.filter(
      brand => !selectedAdditiveBrands.includes(brand)
    );

    if (newBrandsToSelect.length > 0) {
      setSelectedAdditiveBrands([...selectedAdditiveBrands, ...newBrandsToSelect]);
    }
  }, [selectedAdditives, selectedAdditiveBrands, setSelectedAdditiveBrands]);

  // Auto-select first available line when brand is selected in normal mode
  React.useEffect(() => {
    if (!isProMode && nutrientBrand && growMethod && growthStage) {
      const selectedBrand = brands.find(b => b.code === nutrientBrand);
      if (selectedBrand && selectedBrand.nutrients && selectedBrand.nutrients[growMethod]) {
        const nutrients = selectedBrand.nutrients[growMethod][growthStage] || [];
        
        // Check if any nutrients are already selected for this brand and method
        const hasSelectedNutrients = nutrients.some(nutrient => 
          isBaseNutrientSelected(nutrient.name, growMethod)
        );
        
        // If no nutrients selected, auto-select the first available line
        if (!hasSelectedNutrients && nutrients.length > 0) {
          // Group nutrients by line
          const nutrientsByLine = new Map<string, typeof nutrients>();
          nutrients.forEach(nutrient => {
            const lineName = (nutrient as any).line || nutrient.name.replace(/\s+[ABCD]$/, '');
            if (!nutrientsByLine.has(lineName)) {
              nutrientsByLine.set(lineName, []);
            }
            nutrientsByLine.get(lineName)!.push(nutrient);
          });
          
          // Select the first line
          const firstLine = Array.from(nutrientsByLine.values())[0];
          if (firstLine && firstLine.length > 0) {
            const nutrientsToSelect = firstLine.map(nutrient => ({
              name: nutrient.name,
              growMethod: growMethod
            }));
            
            // Only add if not already in selectedBaseNutrients
            const existingKeys = new Set(selectedBaseNutrients.map(n => `${n.name}__${n.growMethod}`));
            const newNutrients = nutrientsToSelect.filter(n => 
              !existingKeys.has(`${n.name}__${n.growMethod}`)
            );
            
            if (newNutrients.length > 0) {
              setSelectedBaseNutrients([...selectedBaseNutrients, ...newNutrients] as any);
            }
          }
        }
      }
    }
  }, [nutrientBrand, growMethod, growthStage, isProMode, brands, isBaseNutrientSelected, selectedBaseNutrients, setSelectedBaseNutrients]);


  const labels = isRussian ? {
    appTitle: 'Настройки рецепта питательных веществ',
    growParams: 'Метод',
    growParamsDesc: 'Выберите вашу среду выращивания',
    growMethod: 'Метод выращивания',
    brand: 'Производитель',
    waterVolume: 'Объем воды',
    baseParams: 'Базовые параметры',
    basePh: 'Базовый pH',
    baseEc: 'Базовый EC (mS/cm)',
    baseTemp: 'Температура (°C)',
    additives: 'Добавки и стимуляторы',
    additivesDesc: 'Вы можете выбрать все что имеется у вас в наличии, в результатах будет отображено только то что применимо на данном этапе.',
    totalSelected: 'Всего выбрано',
    selected: 'выбрано',
    results: 'Результаты',
    resultsDesc: 'Ваш индивидуальный рецепт питательных веществ',
    baseNutrients: 'Базовые удобрения',
    nutrient: 'Линейка',
    per1L: 'На 1л',
    perXL: (v: number) => `На ${v}л`,
    basePhShort: 'Базовый pH',
    baseEcShort: 'Базовый EC',
    baseTempShort: 'Температура',
    ecRange: 'Диапазон EC',
    phRange: 'Диапазон pH',
    selectedAdditives: 'Выбранные добавки',
    additive: 'Добавка',
    copyResults: 'Копировать результаты',
    exportPDF: 'Экспорт в PDF',
    nutrientSettings: 'Базовые удобрения',
    nutrientSettingsDesc: 'Выберите бренд и линейку',
  } : {
    appTitle: 'Precision Nutrient Calculator',
    growParams: 'Method',
    growParamsDesc: 'Select your growing environment',
    growMethod: 'Growing Method',
    brand: 'Base nutrients',
    waterVolume: 'Water Volume',
    baseParams: 'Base Parameters',
    basePh: 'Base pH',
    baseEc: 'Base EC (mS/cm)',
    baseTemp: 'Temperature (°C)',
    additives: 'Additives & Stimulants',
    additivesDesc: 'You can select everything you have in stock, and the results will only show what is applicable at this stage.',
    totalSelected: 'Total Selected',
    selected: 'selected',
    results: 'Results',
    resultsDesc: 'Your custom nutrient recipe',
    baseNutrients: 'Base Nutrients',
    nutrient: 'Nutrient',
    per1L: 'Per 1L',
    perXL: (v: number) => `Per ${v}L`,
    basePhShort: 'Base pH',
    baseEcShort: 'Base EC',
    baseTempShort: 'Temperature',
    ecRange: 'EC Range',
    phRange: 'pH Range',
    selectedAdditives: 'Selected Additives',
    additive: 'Additive',
    copyResults: 'Copy Results',
    exportPDF: 'Export PDF',
    nutrientSettings: 'Base & Volume',
    nutrientSettingsDesc: 'Configure your nutrient brand, water volume, and base parameters',
  }

  // Filtered additives by selected brands
  const rootAdditives: (Additive & { brand: string })[] = brands
    .filter(b => selectedAdditiveBrands.includes(b.code))
    .flatMap(brand =>
      dataService.getAdditives(brand.code)
        .filter(additive => !additive.id.startsWith('general-') && additive.application !== 'foliar')
        .map(additive => ({ ...additive, brand: brand.code }))
    );
  const foliarAdditives: (Additive & { brand: string })[] = brands
    .filter(b => selectedAdditiveBrands.includes(b.code))
    .flatMap(brand =>
      dataService.getAdditives(brand.code)
        .filter(additive => additive.application === 'foliar')
        .map(additive => ({ ...additive, brand: brand.code }))
    );


  // Get brand state: 0 - not selected, 1 - brand selected (no additives), 2 - some additives selected, 3 - all additives selected
  const getBrandState = (brandCode: string) => {
    const brandAdditives = dataService.getAdditives(brandCode);
    const selectableAdditives = brandAdditives.filter(additive => !additive.id.startsWith('general-'));
    const selectedCount = selectableAdditives.filter(additive =>
      selectedAdditives.some(selected => selected.id === additive.id && selected.brand === brandCode)
    ).length;

    if (selectedCount === selectableAdditives.length && selectableAdditives.length > 0) {
      return 3; // All additives selected
    } else if (selectedCount > 0) {
      return 2; // Some additives selected
    } else if (selectedAdditiveBrands.includes(brandCode)) {
      return 1; // Brand selected but no additives
    } else {
      return 0; // Not selected
    }
  };

  // Handle brand card click
  const handleBrandClick = (brandCode: string) => {
    const currentState = getBrandState(brandCode);

    if (currentState === 0) {
      // Select brand (state 1)
      if (!selectedAdditiveBrands.includes(brandCode)) {
        setSelectedAdditiveBrands([...selectedAdditiveBrands, brandCode]);
      }
    } else if (currentState === 1 || currentState === 2) {
      // Select all additives of the brand (state 3)
      const brandAdditives = dataService.getAdditives(brandCode);
      const selectableAdditives = brandAdditives.filter(additive => !additive.id.startsWith('general-'));

      const newSelectedAdditives = selectableAdditives.map(additive => ({
        id: additive.id,
        brand: brandCode
      }));

      // Remove existing selections for this brand and add all
      const filteredAdditives = selectedAdditives.filter(add => add.brand !== brandCode);
      setSelectedAdditives([...filteredAdditives, ...newSelectedAdditives]);
    } else if (currentState === 3) {
      // Deselect everything for this brand (state 0)
      setSelectedAdditives(selectedAdditives.filter(add => add.brand !== brandCode));
      setSelectedAdditiveBrands(selectedAdditiveBrands.filter(code => code !== brandCode));
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
        <header className="mb-8">
          <div className="pl-4">
            <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-left">
              NutriCalc
            </h1>
            <p className="text-muted-foreground text-left">Калькулятор питательных веществ</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {/* Section 1: Nutrient Settings and Base */}
          <SectionCard
            title={labels.nutrientSettings}
            description={labels.nutrientSettingsDesc}
            icon={TestTube2}
            iconColor="text-orange-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="space-y-6">
                <div className="space-y-2">
                  <h4>{labels.brand}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {brands.filter(brand => brand.nutrients && Object.keys(brand.nutrients).length > 0).map((brand) => {
                        const isSelected = isProMode 
                          ? isNutrientBrandSelected(brand.code)
                          : nutrientBrand === brand.code;
                        
                        // Get nutrient brand state (like getBrandState for additives)
                        const getNutrientBrandState = (brandCode: string) => {
                          if (!brand.nutrients) return 0;
                          
                          // Get all nutrients for all methods for this brand
                          let totalNutrients = 0;
                          let selectedCount = 0;
                          
                          Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                            if (methodNutrients[growthStage]) {
                              methodNutrients[growthStage].forEach((nutrient: any) => {
                                totalNutrients++;
                                if (isBaseNutrientSelected(nutrient.name, method)) {
                                  selectedCount++;
                                }
                              });
                            }
                          });
                          
                          if (totalNutrients === 0) {
                            return selectedNutrientBrands.includes(brandCode) ? 1 : 0;
                          }
                          
                          if (selectedCount === totalNutrients) {
                            return 3; // All nutrients selected
                          } else if (selectedCount > 0) {
                            return 2; // Some nutrients selected
                          } else if (selectedNutrientBrands.includes(brandCode)) {
                            return 1; // Brand selected but no nutrients
                          } else {
                            return 0; // Not selected
                          }
                        };
                        
                        const brandState = isProMode ? getNutrientBrandState(brand.code) : (isSelected ? 2 : 0);
                        
                        return (
                          <div
                            key={brand.code}
                            className={`unified-card unified-card-small ${
                              isSelected ? 'selected' : ''
                            } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer`}
                              onClick={() => {
                              if (isProMode) {
                                // Handle nutrient brand state transitions (similar to handleBrandClick for additives)
                                const currentState = getNutrientBrandState(brand.code);
                                
                                if (currentState === 0) {
                                  // State 0 -> 1: Select brand only
                                  if (!selectedNutrientBrands.includes(brand.code)) {
                                    toggleNutrientBrand(brand.code);
                                  }
                                } else if (currentState === 1) {
                                  // State 1 -> 3: Select all nutrients
                                  if (brand.nutrients) {
                                    const nutrientsToSelect: Array<{ name: string; growMethod: GrowMethod }> = [];
                                    Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                                      const methodTyped = method as GrowMethod;
                                      if (methodNutrients[growthStage]) {
                                        methodNutrients[growthStage].forEach((nutrient) => {
                                          nutrientsToSelect.push({ name: nutrient.name, growMethod: methodTyped });
                                        });
                                      }
                                    });
                                    
                                    // Remove existing selections for this brand and add all
                                    // Keep nutrients from other brands
                                    const filteredNutrients = selectedBaseNutrients.filter((n) => {
                                      // Check if this nutrient belongs to THIS brand (if yes, remove it)
                                      const methodTyped = n.growMethod as GrowMethod;
                                      return !brand.nutrients?.[methodTyped]?.[growthStage]?.some((nut) => nut.name === n.name);
                                    });
                                    // Add all nutrients for this brand
                                    setSelectedBaseNutrients([...filteredNutrients, ...nutrientsToSelect]);
                                  }
                                } else if (currentState === 2) {
                                  // State 2 -> 3: Select all remaining nutrients
                                  if (brand.nutrients) {
                                    const nutrientsToSelect: Array<{ name: string; growMethod: GrowMethod }> = [];
                                    Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                                      const methodTyped = method as GrowMethod;
                                      if (methodNutrients[growthStage]) {
                                        methodNutrients[growthStage].forEach((nutrient) => {
                                          nutrientsToSelect.push({ name: nutrient.name, growMethod: methodTyped });
                                        });
                                      }
                                    });
                                    
                                    // Remove existing selections for this brand and add all
                                    // Keep nutrients from other brands
                                    const filteredNutrients = selectedBaseNutrients.filter((n) => {
                                      // Check if this nutrient belongs to THIS brand (if yes, remove it)
                                      const methodTyped = n.growMethod as GrowMethod;
                                      return !brand.nutrients?.[methodTyped]?.[growthStage]?.some((nut) => nut.name === n.name);
                                    });
                                    // Add all nutrients for this brand
                                    setSelectedBaseNutrients([...filteredNutrients, ...nutrientsToSelect]);
                                  }
                                } else if (currentState === 3) {
                                  // State 3 -> 0: Deselect everything (including brand)
                                  if (brand.nutrients) {
                                    const nutrientsToRemove: Array<{ name: string; growMethod: GrowMethod }> = [];
                                    Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                                      const methodTyped = method as GrowMethod;
                                      if (methodNutrients[growthStage]) {
                                        methodNutrients[growthStage].forEach((nutrient) => {
                                          nutrientsToRemove.push({ name: nutrient.name, growMethod: methodTyped });
                                        });
                                      }
                                    });
                                    
                                    // Remove all nutrients from this brand
                                    setSelectedBaseNutrients(selectedBaseNutrients.filter((n) => {
                                      return !nutrientsToRemove.some(remove => remove.name === n.name && remove.growMethod === n.growMethod);
                                    }));
                                  }
                                  
                                  // Also remove the brand
                                  if (selectedNutrientBrands.includes(brand.code)) {
                                    toggleNutrientBrand(brand.code);
                                  }
                                }
                              } else {
                                // In normal mode, toggle selection: if already selected, deselect it
                                if (nutrientBrand === brand.code) {
                                  setNutrientBrand('');
                                  // Also clear selected nutrients when deselecting brand
                                  setSelectedBaseNutrients([]);
                                } else {
                                  setNutrientBrand(brand.code);
                                }
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {brandState === 0 && <Circle className="h-5 w-5 text-gray-400" />}
                                {brandState === 1 && <CircleDot className="h-5 w-5 text-orange-600" />}
                                {brandState === 2 && <Check className="h-5 w-5 text-orange-600" />}
                                {brandState === 3 && <CheckCheck className="h-5 w-5 text-orange-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="unified-card-label text-left">{brand.name}</h5>
                                {!hideDescriptions && (
                                  <span className="unified-card-description line-clamp-2 text-left block">{isRussian && brand.description_ru ? brand.description_ru : brand.description}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Base Nutrients Display */}
                {((isProMode && selectedNutrientBrands.length > 0) || (!isProMode && nutrientBrand)) && (
                  <div className="space-y-2 mt-6">
                    <h4 className="font-semibold">{isRussian ? 'Линейка удобрений' : 'Base Nutrients'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(() => {
                        const nutrientsWithMethod: Array<Nutrient & { growMethod: GrowMethod }> = [];
                        
                        if (isProMode) {
                          // In Pro mode, show nutrients from all selected brands
                          selectedNutrientBrands.forEach(brandCode => {
                            const brand = brands.find(b => b.code === brandCode);
                            if (brand && brand.nutrients) {
                              Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                                const methodTyped = method as GrowMethod;
                                if (methodNutrients[growthStage]) {
                                  methodNutrients[growthStage].forEach(nutrient => {
                                    nutrientsWithMethod.push({ ...nutrient, growMethod: methodTyped });
                                  });
                                }
                              });
                            }
                          });
                        } else {
                          // In normal mode, show only nutrients for the selected grow method
                          const selectedBrand = brands.find(b => b.code === nutrientBrand);
                          if (!selectedBrand || !selectedBrand.nutrients || !growMethod) return null;
                          
                          // Get nutrients only for the selected grow method
                          const methodNutrients = selectedBrand.nutrients[growMethod];
                          if (methodNutrients && methodNutrients[growthStage]) {
                            methodNutrients[growthStage].forEach(nutrient => {
                              nutrientsWithMethod.push({ ...nutrient, growMethod: growMethod });
                            });
                          }
                        }

                        // Group nutrients by 'line' field only
                        const nutrientGroups = new Map<string, Array<Nutrient & { growMethod: GrowMethod }>>();
                        
                        nutrientsWithMethod.forEach(nutrient => {
                          // Get line name from the nutrient data
                          const lineName = (nutrient as any).line || nutrient.name;
                          
                          // Create unique key combining line name and growMethod
                          const groupKey = `${lineName}_${nutrient.growMethod}`;
                          
                          if (!nutrientGroups.has(groupKey)) {
                            nutrientGroups.set(groupKey, []);
                          }
                          
                          nutrientGroups.get(groupKey)!.push(nutrient);
                        });
                        
                        // Render grouped nutrient lines
                        return Array.from(nutrientGroups.entries()).map(([groupKey, products]) => {
                          // Extract root name from group key (before the underscore)
                          const rootName = groupKey.split('_')[0];
                          // Check if all products in this group are selected
                          const allSelected = products.every(nutrient => 
                            isBaseNutrientSelected(nutrient.name, nutrient.growMethod)
                          );
                          const someSelected = products.some(nutrient => 
                            isBaseNutrientSelected(nutrient.name, nutrient.growMethod)
                          );
                          
                          // Check if this line is for the selected grow method
                          const isForSelectedMethod = products[0]?.growMethod === growMethod;
                          const isActive = isProMode || isForSelectedMethod;
                          
                          // In normal mode, if this is for the selected method, force it to be selected (locked)
                          const isLocked = !isProMode && isForSelectedMethod && !!growMethod;
                          
                          return (
                            <div
                              key={groupKey}
                              className={`unified-card unified-card-small ${(allSelected || isLocked) && isActive ? 'selected' : ''} ${someSelected && !allSelected && !isLocked ? 'border-orange-400 border-2' : ''} ${isActive ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                              style={{ minHeight: '60px' }}
                              onClick={(e) => {
                                // Don't allow clicks on inactive cards in normal mode
                                if (!isActive) return;
                                
                                // Don't allow clicks on locked cards (selected method in normal mode)
                                if (isLocked) return;
                                
                                e.stopPropagation()
                                e.preventDefault()
                                
                                // Build new selection atomically to avoid double-click perception
                                const current = selectedBaseNutrients as Array<{ name: string; growMethod: string }>;
                                const productKeys = new Set(products.map(p => `${p.name}__${p.growMethod}`));
                                const allSelectedNow = products.every(p => isBaseNutrientSelected(p.name, p.growMethod));
                                
                                if (allSelectedNow) {
                                  // Deselect all products of this line
                                  const next = current.filter(n => !productKeys.has(`${n.name}__${n.growMethod}`));
                                  setSelectedBaseNutrients(next as any);
                                } else {
                                  // Add all not yet selected of this line
                                  const existingKeys = new Set(current.map(n => `${n.name}__${n.growMethod}`));
                                  const additions = products
                                    .filter(p => !existingKeys.has(`${p.name}__${p.growMethod}`))
                                    .map(p => ({ name: p.name, growMethod: p.growMethod }));
                                  setSelectedBaseNutrients([...(current as any), ...additions] as any);
                                }
                              }}
                            >
                              <div className="unified-card-content">
                                <h5 className="unified-card-label">
                                  {rootName}
                                </h5>
                                {!hideDescriptions && products.length > 0 && (() => {
                                  // In Pro Mode, show all products; otherwise filter by non-zero doses
                                  const activeProducts = isProMode 
                                    ? products 
                                    : products.filter((nutrient: any) => {
                                        const perLiter = nutrient.perLiter || '0ml';
                                        const cleanValue = perLiter.replace(/[^0-9.-]/g, '');
                                        return cleanValue !== '0' && cleanValue !== '0.0' && cleanValue !== '';
                                      });
                                  
                                  if (activeProducts.length === 0) {
                                    return (
                                      <span className="text-xs text-muted-foreground">
                                        {isRussian ? 'Не рекомендуется на данном этапе' : 'Not recommended at this stage'}
                                      </span>
                                    );
                                  }
                                  
                                  return (
                                    <div className="unified-card-description space-y-1 text-left">
                                      {activeProducts.map((nutrient: any, idx: number) => {
                                        // Determine if this nutrient's growMethod matches current growMethod (in all modes)
                                        const methodMatches = (nutrient.growMethod === growMethod);
                                        let perLiter = methodMatches ? (nutrient.perLiter || '0ml') : '0ml';
                                        
                                        // Apply averaging if toggle is on and perLiter contains a range
                                        if (showAverageValues && perLiter.includes('-')) {
                                          const rangeMatch = perLiter.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
                                          if (rangeMatch) {
                                            const min = parseFloat(rangeMatch[1]);
                                            const max = parseFloat(rangeMatch[2]);
                                            const avg = ((min + max) / 2).toFixed(2);
                                            // Preserve the unit (ml)
                                            perLiter = `${avg}${perLiter.replace(/[^а-яa-z]/gi, '')}`;
                                          }
                                        }
                                        
                                        const cleanValue = perLiter.replace(/[^0-9.-]/g, '');
                                        const isZero = cleanValue === '0' || cleanValue === '0.0' || cleanValue === '';
                                        
                                        return (
                                          <div 
                                            key={idx} 
                                            className={`text-xs text-muted-foreground flex items-center gap-1 ${isZero ? 'line-through opacity-50' : ''}`}
                                          >
                                            <span className={`${isZero ? 'text-red-600' : 'text-green-600'}`}>{isZero ? '✖' : '✔'}</span>
                                            <span className="truncate">
                                              {nutrient.name}{!isZero ? `: ${perLiter}` : ''}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
            </div>
          </SectionCard>
        </div>

        {/* Section 3: Additives */}
        <SectionCard
          className="mt-6"
          title={labels.additives}
          description={labels.additivesDesc}
          icon={PlusSquare}
          iconColor="text-blue-500"
          hideDescriptions={hideDescriptions}
        >
            <div className="space-y-8">
                {/* Additive Brand Selection */}
                <div>
                  <h4 className="mb-2">{isRussian ? 'Бренд' : 'Brand'}</h4>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                    {brands.filter(brand => brand.additives && brand.additives.length > 0).map(brand => {
                      const brandState = getBrandState(brand.code);
                      return (
                        <div
                          key={brand.code}
                          className={`unified-card unified-card-small ${selectedAdditiveBrands.includes(brand.code) ? 'selected' : ''} cursor-pointer`}
                          onClick={() => handleBrandClick(brand.code)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {brandState === 0 && <Circle className="h-5 w-5 text-gray-400" />}
                              {brandState === 1 && <CircleDot className="h-5 w-5 text-orange-600" />}
                              {brandState === 2 && <Check className="h-5 w-5 text-orange-600" />}
                              {brandState === 3 && <CheckCheck className="h-5 w-5 text-orange-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="unified-card-label text-left">{brand.name}</h5>
                              {!hideDescriptions && (
                                <span className="unified-card-description line-clamp-2 text-left block">{isRussian && brand.description_ru ? brand.description_ru : brand.description}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Root Additives */}
                {selectedAdditiveBrands.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center justify-center gap-2">
                      <Droplet className="h-5 w-5 text-green-600" />
                      {isRussian ? 'Добавки для корневого полива' : 'Root Additives'}
                      </h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {rootAdditives
                        .map((additive) => {
                          let dose = (additive.stages as Record<string, string>)[growthStage] || "0";
                          
                          // Apply averaging if toggle is on and dose contains a range
                          if (showAverageValues && dose.includes('-')) {
                            const rangeMatch = dose.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
                            if (rangeMatch) {
                              const min = parseFloat(rangeMatch[1]);
                              const max = parseFloat(rangeMatch[2]);
                              const avg = ((min + max) / 2).toFixed(2);
                              dose = avg;
                            }
                          }
                          
                          const isZero = !dose || /^0(\.0*)?(ml|мл)?$/i.test(dose.trim());
                          return (
                            <div
                              key={`${additive.brand}-${additive.id}`}
                              className={`unified-card unified-card-small ${isAdditiveSelected(additive.id, additive.brand) ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''}`}
                              onClick={() => toggleAdditive(additive.id, additive.brand)}
                            >
                              <div className="unified-card-content">
                                <h5 className="unified-card-label">{additive.name}</h5>
                                {!hideDescriptions && (
                                  <span className="unified-card-description line-clamp-2">{isRussian ? additive.description_ru : additive.description}</span>
                                )}
                                <span className="unified-card-dose">
                                  {isZero
                                    ? (isRussian ? 'Не рекомендуется на данном этапе' : 'Not recommended at this stage')
                                    : (additive.application === 'foliar'
                                        ? dose
                                        : (isRussian ? `${dose}мл/л` : `${dose}ml/L`)
                                      )
                                  }
                                </span>
                      </div>
                    </div>
                          )
                        })}
                    </div>
                  </div>
                )}
                {/* Foliar Additives */}
                {selectedAdditiveBrands.length > 0 && foliarAdditives.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center justify-center gap-2">
                      <SprayCan className="h-5 w-5 text-sky-500" />
                      {isRussian ? 'Для обработки по листу' : 'For Leaf Spray'}
                    </h4>
                    <div style={{height: '1em'}} />
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {foliarAdditives
                        .map((additive) => {

                          const hasStages = 'stages' in additive && typeof additive.stages === 'object';
                          const stageDose = hasStages ? (additive.stages as Record<string, string>)[growthStage] : undefined;
                          
                          // Apply averaging to defaultDose if toggle is on
                          let defaultDose = additive.defaultDose;
                          if (showAverageValues && defaultDose && defaultDose.includes('-')) {
                            const rangeMatch = defaultDose.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
                            if (rangeMatch) {
                              const min = parseFloat(rangeMatch[1]);
                              const max = parseFloat(rangeMatch[2]);
                              const avg = ((min + max) / 2).toFixed(2);
                              defaultDose = avg;
                            }
                          }
                          
                          const isZero = !stageDose || /^0(\.0*)?(ml|мл)?$/i.test((stageDose ?? '').trim());
                          return (
                            <div
                              key={additive.id}
                              className={`unified-card unified-card-small ${isAdditiveSelected(additive.id, additive.brand) ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''}`}
                              onClick={() => toggleAdditive(additive.id, additive.brand)}
                            >
                              <div className="unified-card-content">
                                  <h5 className="unified-card-label">{additive.name}</h5>
                                  {!hideDescriptions && (
                                    <span className="unified-card-description line-clamp-2">{isRussian ? additive.description_ru : additive.description}</span>
                                  )}
                                <span className="unified-card-dose">
                                  {isZero
                                    ? (isRussian ? 'Не рекомендуется на данном этапе' : 'Not recommended at this stage')
                                    : (isRussian
                                        ? additive.foliarDose
                                        : additive.foliarDose?.replace(/капли/gi, 'drop').replace(/мл/gi, 'ml')
                                      )
                                  }
                                </span>
                                {!isZero && defaultDose && defaultDose !== '0' && (
                                  <span className="unified-card-dose text-xs text-muted-foreground">
                                    {isRussian ? `${defaultDose}мл/л` : `${defaultDose}ml/L`}
                                  </span>
                                )}
                                </div>
                              </div>
                          )
                        })}
                        </div>
                      </div>
                    )}
            </div>
          </SectionCard>

        {/* Selection Summary and Actions */}
        <div className="mt-6">
          <SectionCard
            title={`${labels.totalSelected}:`}
            icon={CheckSquare}
            iconColor="text-green-500"
          >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-lg">
                      <div>{isRussian ? 'Добавки' : 'Additives'}: {selectedAdditives.length}</div>
                      <div>{isRussian ? 'Базовые' : 'Base'}: {(() => {
                        // Count unique nutrient lines using the 'line' field
                        const uniqueLines = new Set();
                        if (isProMode && selectedNutrientBrands.length > 0) {
                          selectedNutrientBrands.forEach(brandCode => {
                            const brand = brands.find(b => b.code === brandCode);
                            if (brand && brand.nutrients) {
                              Object.entries(brand.nutrients).forEach(([method, methodNutrients]) => {
                                if (methodNutrients[growthStage]) {
                                  methodNutrients[growthStage].forEach(nutrient => {
                                    const isSelected = isBaseNutrientSelected(nutrient.name, method);
                                    if (isSelected) {
                                      // Use line field if available, otherwise group by base name
                                      const lineName = (nutrient as any).line || nutrient.name.replace(/\s+[ABCD]$/, '');
                                      uniqueLines.add(`${lineName}_${method}`);
                                    }
                                  });
                                }
                              });
                            }
                          });
                        } else if (nutrientBrand) {
                          const selectedBrand = brands.find(b => b.code === nutrientBrand);
                          if (selectedBrand && selectedBrand.nutrients && growMethod) {
                            const methodTyped = growMethod as GrowMethod;
                            const nutrients = selectedBrand.nutrients[methodTyped]?.[growthStage] || [];
                            nutrients.forEach(nutrient => {
                              const isSelected = isBaseNutrientSelected(nutrient.name, growMethod);
                              if (isSelected) {
                                const lineName = (nutrient as any).line || nutrient.name.replace(/\s+[ABCD]$/, '');
                                uniqueLines.add(`${lineName}_${growMethod}`);
                              }
                            });
                          }
                        }
                        return uniqueLines.size;
                      })()} {isRussian ? 'линейка' : 'line'}</div>
                    </div>
                  </div>
            </SectionCard>
        </div>
      </div>
      <BottomNavigation />
    </TooltipProvider>
  )
}
