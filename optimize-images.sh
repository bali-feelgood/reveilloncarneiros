#!/bin/bash

# Script de Otimização de Imagens para Réveillon Carneiros
# Este script converte todas as imagens JPG para WebP e cria versões mobile

echo "🎯 Iniciando otimização de imagens..."
echo "======================================="

# Função para converter uma imagem
convert_image() {
    local input_file=$1
    local dir=$(dirname "$input_file")
    local filename=$(basename "$input_file" .jpg)
    
    # Pula arquivos já processados (-768.jpg)
    if [[ "$filename" == *"-768" ]]; then
        return
    fi
    
    echo "📸 Processando: $input_file"
    
    # Otimiza o JPG original primeiro
    echo "  → Otimizando JPG original..."
    convert "$input_file" -quality 85 -strip "${dir}/${filename}-temp.jpg"
    mv "${dir}/${filename}-temp.jpg" "$input_file"
    
    # Cria versão WebP desktop (qualidade 85)
    echo "  → Criando versão WebP..."
    cwebp -q 85 "$input_file" -o "${dir}/${filename}.webp" 2>/dev/null
    
    # Cria versão mobile JPG (768px largura)
    echo "  → Criando versão mobile JPG..."
    convert "$input_file" -resize 768x\> -quality 80 "${dir}/${filename}-768.jpg"
    
    # Cria versão mobile WebP
    echo "  → Criando versão mobile WebP..."
    cwebp -q 80 "${dir}/${filename}-768.jpg" -o "${dir}/${filename}-768.webp" 2>/dev/null
    
    echo "  ✅ Concluído!"
    echo ""
}

# Conta arquivos
total_files=0

# Processa todas as imagens JPG
echo ""
echo "🔄 Convertendo imagens..."
echo "========================"

find assets/images -name "*.jpg" -type f | while read file; do
    convert_image "$file"
    ((total_files++))
done

echo ""
echo "✨ OTIMIZAÇÃO CONCLUÍDA!"
echo "========================"
echo ""
echo "🚀 Próximos passos:"
echo "1. Verifique se as imagens foram criadas: ls assets/images/*/"
echo "2. Faça commit das novas imagens"
echo "3. Faça push para o Netlify"
echo "4. Teste no PageSpeed Insights"